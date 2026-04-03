import type { AgitationId, GuidedActionType } from '../types';

const MIN_INTERVAL_MINUTES = 4;
const MAX_INTERVAL_MINUTES = 7;
const PREFERRED_MIN_INTERVAL_MINUTES = 5;
const PREFERRED_MAX_INTERVAL_MINUTES = 6.5;
const TARGET_INTERVAL_MINUTES = 5.75;

export interface CookTimeWindow {
  low: number;
  high: number;
  label: string;
}

export interface CookTimeRangeLike {
  low: number;
  high: number;
  label?: string;
}

export interface GuidedActionSource {
  agitationId: AgitationId;
  checkAt?: number;
  recommendedCookMinutes?: number;
  actionTimes?: number[];
  actionType?: GuidedActionType;
  timeRange: CookTimeRangeLike;
}

export interface GuidedActionDetails {
  recommendedCookMinutes: number;
  actionType: GuidedActionType;
  actionTimes: number[];
  actionSummary: string;
}

export interface GuidedTimerReminder {
  id: string;
  seconds: number;
  label: string;
}

export interface GuidedTimerPlan {
  signature: string;
  recommendedCookMinutes: number;
  recommendedCookLabel: string;
  estimatedRangeLabel: string;
  totalSeconds: number;
  actionType: GuidedActionType;
  actionTimes: number[];
  actionSummary: string;
  actionSummaryLabel: string;
  reminders: GuidedTimerReminder[];
  actionPrompt: string;
  nextActionLabel: string;
  scheduleLabel: string;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function createCookTimeWindow(low: number, high: number, label: string): CookTimeWindow {
  const normalizedLow = Math.max(0, Math.min(low, high));
  const normalizedHigh = Math.max(normalizedLow, Math.max(low, high));

  return {
    low: normalizedLow,
    high: normalizedHigh,
    label,
  };
}

function buildDefaultRangeLabel(low: number, high: number): string {
  if (low === high) {
    return `${low} minute${low === 1 ? '' : 's'}`;
  }

  return `${low}-${high} minutes`;
}

function formatActionTimes(labels: string[]): string {
  if (labels.length === 0) {
    return '';
  }

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function getPreferredShakeCount(totalMinutes: number): number | null {
  const maxCount = Math.max(2, Math.ceil(totalMinutes / MIN_INTERVAL_MINUTES) - 1);
  const candidates: Array<{
    count: number;
    intervalMinutes: number;
    preferred: boolean;
    distance: number;
  }> = [];

  for (let count = 2; count <= maxCount; count += 1) {
    const intervalMinutes = totalMinutes / (count + 1);
    const lastReminderRemainingMinutes = totalMinutes - intervalMinutes * count;

    if (intervalMinutes < MIN_INTERVAL_MINUTES || intervalMinutes > MAX_INTERVAL_MINUTES) {
      continue;
    }

    if (lastReminderRemainingMinutes <= 2) {
      continue;
    }

    candidates.push({
      count,
      intervalMinutes,
      preferred:
        intervalMinutes >= PREFERRED_MIN_INTERVAL_MINUTES &&
        intervalMinutes <= PREFERRED_MAX_INTERVAL_MINUTES,
      distance: Math.abs(intervalMinutes - TARGET_INTERVAL_MINUTES),
    });
  }

  const preferredCandidate = candidates.find((candidate) => candidate.preferred);
  if (preferredCandidate) {
    return preferredCandidate.count;
  }

  if (candidates.length > 0) {
    candidates.sort((left, right) => {
      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }

      return left.count - right.count;
    });

    return candidates[0].count;
  }

  return null;
}

function buildActionSummary(actionType: GuidedActionType, actionTimes: number[]): string {
  if (actionType === 'none' || actionTimes.length === 0) {
    return 'None needed';
  }

  const timeLabels = formatActionTimes(actionTimes.map((time) => formatTimerClock(time)));

  switch (actionType) {
    case 'turn':
      return actionTimes.length === 1 ? `Turn once at ${timeLabels}` : `Turn at ${timeLabels}`;
    case 'check':
      return `Check at ${timeLabels}`;
    case 'shake':
    default:
      return `Shake at ${timeLabels}`;
  }
}

function getReminderCopy(actionType: GuidedActionType): Pick<
  GuidedTimerPlan,
  'actionPrompt' | 'nextActionLabel' | 'scheduleLabel'
> {
  switch (actionType) {
    case 'turn':
      return {
        actionPrompt: 'Turn now',
        nextActionLabel: 'Next turn',
        scheduleLabel: 'Turn reminders',
      };
    case 'check':
      return {
        actionPrompt: 'Check now',
        nextActionLabel: 'Next check',
        scheduleLabel: 'Check times',
      };
    case 'none':
      return {
        actionPrompt: 'No mid-cook action needed',
        nextActionLabel: 'Next alert',
        scheduleLabel: 'Alert times',
      };
    case 'shake':
    default:
      return {
        actionPrompt: 'Shake now',
        nextActionLabel: 'Next shake',
        scheduleLabel: 'Shake times',
      };
  }
}

function generateHalfwayActionTimes(totalSeconds: number): number[] {
  return [Math.round(totalSeconds / 2)];
}

function generateShakeActionTimes(recommendedCookMinutes: number): number[] {
  const totalSeconds = Math.round(recommendedCookMinutes * 60);

  if (recommendedCookMinutes < 16) {
    return generateHalfwayActionTimes(totalSeconds);
  }

  const reminderCount = getPreferredShakeCount(recommendedCookMinutes);
  if (reminderCount === null) {
    return [];
  }

  return Array.from({ length: reminderCount }, (_, index) =>
    Math.round((totalSeconds * (index + 1)) / (reminderCount + 1)),
  );
}

function generateTurnActionTimes(recommendedCookMinutes: number): number[] {
  return generateHalfwayActionTimes(Math.round(recommendedCookMinutes * 60));
}

function generateCheckActionTimes(
  recommendedCookMinutes: number,
  checkAt?: number,
): number[] {
  const totalSeconds = Math.round(recommendedCookMinutes * 60);
  const preferredCheckSeconds = typeof checkAt === 'number' ? Math.round(checkAt * 60) : NaN;

  if (
    Number.isFinite(preferredCheckSeconds) &&
    preferredCheckSeconds > 0 &&
    preferredCheckSeconds < totalSeconds
  ) {
    return [preferredCheckSeconds];
  }

  return generateHalfwayActionTimes(totalSeconds);
}

function buildReminderLabel(seconds: number): string {
  return formatTimerClock(seconds);
}

export function formatTimerClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function parseCookTimeRangeLabel(label: string): CookTimeWindow | null {
  const trimmed = label.trim();
  if (trimmed === '') {
    return null;
  }

  const rangeMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:-|\u2013|to)\s*(\d+(?:\.\d+)?)/i);
  if (rangeMatch) {
    const low = Number(rangeMatch[1]);
    const high = Number(rangeMatch[2]);

    if (isFiniteNumber(low) && isFiniteNumber(high)) {
      return createCookTimeWindow(low, high, trimmed);
    }
  }

  const singleMatch = trimmed.match(/(\d+(?:\.\d+)?)/);
  if (!singleMatch) {
    return null;
  }

  const value = Number(singleMatch[1]);
  if (!isFiniteNumber(value)) {
    return null;
  }

  return createCookTimeWindow(value, value, trimmed);
}

export function resolveCookTimeWindow(
  source: CookTimeRangeLike | string | null | undefined,
): CookTimeWindow | null {
  if (!source) {
    return null;
  }

  if (typeof source === 'string') {
    return parseCookTimeRangeLabel(source);
  }

  if (isFiniteNumber(source.low) && isFiniteNumber(source.high)) {
    return createCookTimeWindow(
      source.low,
      source.high,
      source.label || buildDefaultRangeLabel(source.low, source.high),
    );
  }

  if (source.label) {
    return parseCookTimeRangeLabel(source.label);
  }

  return null;
}

export function deriveRecommendedCookMinutes(
  source: CookTimeRangeLike | string | null | undefined,
): number | null {
  const cookTimeWindow = resolveCookTimeWindow(source);
  if (!cookTimeWindow) {
    return null;
  }

  return Math.ceil((cookTimeWindow.low + cookTimeWindow.high) / 2);
}

export function resolveActionType(agitationId: AgitationId): GuidedActionType {
  switch (agitationId) {
    case 'turn_halfway':
    case 'turn_or_shake_halfway':
      return 'turn';
    case 'depends':
      return 'check';
    case 'usually_no_agitation':
      return 'none';
    case 'shake_or_turn_halfway':
    case 'shake_halfway':
    default:
      return 'shake';
  }
}

export function generateActionTimes(params: {
  actionType: GuidedActionType;
  checkAt?: number;
  recommendedCookMinutes: number;
}): number[] {
  const { actionType, checkAt, recommendedCookMinutes } = params;

  if (!Number.isFinite(recommendedCookMinutes) || recommendedCookMinutes <= 0) {
    return [];
  }

  switch (actionType) {
    case 'turn':
      return generateTurnActionTimes(recommendedCookMinutes);
    case 'check':
      return generateCheckActionTimes(recommendedCookMinutes, checkAt);
    case 'none':
      return [];
    case 'shake':
    default:
      return generateShakeActionTimes(recommendedCookMinutes);
  }
}

export function buildGuidedActionDetails(
  source: GuidedActionSource | null | undefined,
): GuidedActionDetails | null {
  if (!source) {
    return null;
  }

  const cookTimeWindow = resolveCookTimeWindow(source.timeRange);
  if (!cookTimeWindow) {
    return null;
  }

  const recommendedCookMinutes =
    source.recommendedCookMinutes ?? deriveRecommendedCookMinutes(cookTimeWindow);
  if (recommendedCookMinutes === null) {
    return null;
  }

  const actionType = source.actionType ?? resolveActionType(source.agitationId);
  const actionTimes =
    source.actionTimes ??
    generateActionTimes({
      actionType,
      checkAt: source.checkAt,
      recommendedCookMinutes,
    });

  return {
    recommendedCookMinutes,
    actionType,
    actionTimes,
    actionSummary: buildActionSummary(actionType, actionTimes),
  };
}

export function buildGuidedTimerPlan(
  source: GuidedActionSource | null | undefined,
): GuidedTimerPlan | null {
  if (!source) {
    return null;
  }

  const cookTimeWindow = resolveCookTimeWindow(source.timeRange);
  const guidedActionDetails = buildGuidedActionDetails(source);

  if (!cookTimeWindow || !guidedActionDetails) {
    return null;
  }

  const reminders = guidedActionDetails.actionTimes.map((seconds, index) => ({
    id: `reminder-${index + 1}`,
    seconds,
    label: buildReminderLabel(seconds),
  }));

  return {
    signature: `${cookTimeWindow.low}-${cookTimeWindow.high}-${guidedActionDetails.actionType}-${guidedActionDetails.actionTimes.join(',')}`,
    recommendedCookMinutes: guidedActionDetails.recommendedCookMinutes,
    recommendedCookLabel: `${guidedActionDetails.recommendedCookMinutes} min${guidedActionDetails.recommendedCookMinutes === 1 ? '' : 's'}`,
    estimatedRangeLabel: cookTimeWindow.label,
    totalSeconds: guidedActionDetails.recommendedCookMinutes * 60,
    actionType: guidedActionDetails.actionType,
    actionTimes: guidedActionDetails.actionTimes,
    actionSummary: guidedActionDetails.actionSummary,
    actionSummaryLabel:
      guidedActionDetails.actionTimes.length > 1 ? 'Mid-cook actions' : 'Mid-cook action',
    reminders,
    ...getReminderCopy(guidedActionDetails.actionType),
  };
}
