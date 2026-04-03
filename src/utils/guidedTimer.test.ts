import {
  buildGuidedActionDetails,
  buildGuidedTimerPlan,
  deriveRecommendedCookMinutes,
  formatTimerClock,
  generateActionTimes,
  parseCookTimeRangeLabel,
  resolveActionType,
} from './guidedTimer';

describe('parseCookTimeRangeLabel', () => {
  it('parses time ranges from labels', () => {
    expect(parseCookTimeRangeLabel('11-14 minutes')).toEqual({
      low: 11,
      high: 14,
      label: '11-14 minutes',
    });
  });

  it('parses fixed single times', () => {
    expect(parseCookTimeRangeLabel('12 mins')).toEqual({
      low: 12,
      high: 12,
      label: '12 mins',
    });
  });

  it('returns null for malformed values', () => {
    expect(parseCookTimeRangeLabel('soon-ish')).toBeNull();
  });
});

describe('deriveRecommendedCookMinutes', () => {
  it('uses the midpoint rounded up for ranges', () => {
    expect(deriveRecommendedCookMinutes('11-14 minutes')).toBe(13);
  });

  it('keeps fixed single times as-is', () => {
    expect(deriveRecommendedCookMinutes('12 mins')).toBe(12);
  });
});

describe('resolveActionType', () => {
  it('maps agitation guidance into a default timer action type', () => {
    expect(resolveActionType('shake_halfway')).toBe('shake');
    expect(resolveActionType('turn_halfway')).toBe('turn');
    expect(resolveActionType('depends')).toBe('check');
    expect(resolveActionType('usually_no_agitation')).toBe('none');
  });
});

describe('generateActionTimes', () => {
  it('creates one halfway shake reminder for shorter cooks', () => {
    expect(generateActionTimes({ actionType: 'shake', recommendedCookMinutes: 13 })).toEqual([
      390,
    ]);
  });

  it('creates evenly spaced shake reminders for longer cooks', () => {
    expect(generateActionTimes({ actionType: 'shake', recommendedCookMinutes: 17 })).toEqual([
      340,
      680,
    ]);
  });

  it('uses three shake reminders for 22 minutes instead of a late 20-minute prompt', () => {
    expect(generateActionTimes({ actionType: 'shake', recommendedCookMinutes: 22 })).toEqual([
      330,
      660,
      990,
    ]);
  });

  it('keeps turn reminders to one halfway action', () => {
    expect(generateActionTimes({ actionType: 'turn', recommendedCookMinutes: 22 })).toEqual([
      660,
    ]);
  });

  it('uses checkAt when check reminders have a later guidance point', () => {
    expect(
      generateActionTimes({
        actionType: 'check',
        checkAt: 10,
        recommendedCookMinutes: 20,
      }),
    ).toEqual([600]);
  });

  it('falls back to halfway for check reminders when checkAt is invalid', () => {
    expect(
      generateActionTimes({
        actionType: 'check',
        checkAt: 14,
        recommendedCookMinutes: 12,
      }),
    ).toEqual([360]);
  });

  it('suppresses reminders when no action is recommended', () => {
    expect(generateActionTimes({ actionType: 'none', recommendedCookMinutes: 10 })).toEqual([]);
  });
});

describe('buildGuidedActionDetails', () => {
  it('returns recommended cook time, action type, and action times together', () => {
    expect(
      buildGuidedActionDetails({
        agitationId: 'turn_halfway',
        timeRange: {
          low: 20,
          high: 24,
          label: '20-24 minutes',
        },
      }),
    ).toEqual({
      recommendedCookMinutes: 22,
      actionType: 'turn',
      actionTimes: [660],
      actionSummary: 'Turn once at 11:00',
    });
  });
});

describe('buildGuidedTimerPlan', () => {
  it('builds the timer display plan from the guided action details', () => {
    expect(
      buildGuidedTimerPlan({
        agitationId: 'depends',
        checkAt: 12,
        timeRange: {
          low: 16,
          high: 20,
          label: '16-20 minutes',
        },
      }),
    ).toMatchObject({
      recommendedCookMinutes: 18,
      recommendedCookLabel: '18 mins',
      estimatedRangeLabel: '16-20 minutes',
      totalSeconds: 1080,
      actionType: 'check',
      actionTimes: [720],
      actionSummary: 'Check at 12:00',
      actionSummaryLabel: 'Mid-cook action',
      actionPrompt: 'Check now',
      nextActionLabel: 'Next check',
    });
  });
});

describe('formatTimerClock', () => {
  it('formats timer values as minutes and seconds', () => {
    expect(formatTimerClock(390)).toBe('6:30');
    expect(formatTimerClock(780)).toBe('13:00');
  });
});
