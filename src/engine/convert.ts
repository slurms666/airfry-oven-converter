import { categoryProfileMap } from '../data/categoryProfiles';
import { fryerClassProfileMap } from '../data/fryerClassProfiles';
import {
  crispnessMultipliers,
  loadMultipliers,
  stateMultipliers,
  temperatureClamp,
  thicknessMultipliers,
} from '../data/multipliers';
import type {
  BasketLoad,
  CategoryProfile,
  ConversionInput,
  ConversionResult,
  FryerClassProfile,
  Thickness,
} from '../types';
import { calculateConfidence, describeLoadEffect } from './confidence';

export function normalizeOvenTemp(
  ovenTemp: number,
  ovenType: ConversionInput['ovenType'],
): number {
  return ovenType === 'conventional' ? ovenTemp - 20 : ovenTemp;
}

function getLoadMultiplier(load: BasketLoad, fryerClass: FryerClassProfile): number {
  return loadMultipliers[load] + (fryerClass.loadAdjustments[load] ?? 0);
}

function getThicknessMultiplier(
  thickness: Thickness | undefined,
  category: CategoryProfile,
): number {
  if (!category.supportsThickness || thickness === undefined) {
    return 1;
  }

  return thicknessMultipliers[thickness];
}

function getWattageMultiplier(exactWattage?: number): number {
  if (exactWattage === undefined) {
    return 1;
  }

  if (exactWattage < 1500) {
    return 1.05;
  }

  if (exactWattage > 1800) {
    return 0.95;
  }

  return 1;
}

function clampTemp(temp: number): number {
  return Math.max(temperatureClamp.min, Math.min(temp, temperatureClamp.max));
}

function buildTimeRange(estimate: number, spread: number): ConversionResult['timeRange'] {
  const shortCook = estimate < 6;

  const low = shortCook
    ? Math.max(1, Math.round(estimate - 0.4))
    : Math.max(1, Math.round(estimate * (1 - spread)));

  let high = shortCook
    ? Math.max(low + 1, Math.round(estimate + 0.4))
    : Math.max(low + 1, Math.round(estimate * (1 + spread)));

  if (high <= low) {
    high = low + 1;
  }

  return {
    low,
    high,
    label: `${low}-${high} minutes`,
  };
}

function resolveAgitationText(category: CategoryProfile): string {
  switch (category.agitation) {
    case 'shake_halfway':
      return 'Shake halfway through';
    case 'turn_halfway':
      return 'Turn halfway through';
    case 'shake_or_turn_halfway':
      return 'Shake or turn halfway through';
    case 'turn_or_shake_halfway':
      return 'Turn or shake halfway through';
    case 'usually_no_agitation':
      return 'No agitation is usually needed';
    case 'depends':
      return 'Turn or rearrange once if pieces overlap';
    default:
      return 'Check once partway through cooking';
  }
}

function buildNotes(
  input: Required<Pick<ConversionInput, 'basketLoad' | 'ovenType'>> &
    Pick<ConversionInput, 'exactWattage'>,
  category: CategoryProfile,
  fryerClass: FryerClassProfile,
  confidence: ReturnType<typeof calculateConfidence>,
): string[] {
  const notes = ['Use this as a starting point and adjust if needed.'];

  if (category.pipingHotNote) {
    notes.push('Ensure the food is piping hot throughout before serving.');
  }

  if (category.browningCaution) {
    notes.push('If the outside browns too fast, lower the temperature slightly and cook for longer.');
  }

  if (input.basketLoad === 'crowded') {
    notes.push(category.batchGuidance);
  }

  if (fryerClass.id === 'oven_or_combi_large') {
    notes.push('Tray-style air fryers can brown differently from drawer models, so check the finish early.');
  }

  if (input.exactWattage !== undefined) {
    if (input.exactWattage < 1500) {
      notes.push('Lower wattage nudged the timing a little longer.');
    } else if (input.exactWattage > 1800) {
      notes.push('Higher wattage nudged the timing a little shorter.');
    }
  }

  if (input.ovenType === 'conventional') {
    notes.push('The estimate starts from a fan-equivalent oven baseline.');
  }

  if (confidence.level === 'low') {
    notes.push('Results may vary more than usual for this combination.');
  }

  return notes;
}

export function convertOvenToAirFryer(input: ConversionInput): ConversionResult {
  const category = categoryProfileMap[input.categoryId];
  const fryerClass = fryerClassProfileMap[input.fryerClassId];
  const state = input.state ?? category.defaultState;
  const basketLoad = input.basketLoad ?? 'single_layer';
  const crispness = input.crispness ?? 'standard';
  const thickness = category.supportsThickness ? input.thickness : undefined;
  const normalizedOvenTemp = normalizeOvenTemp(input.ovenTemp, input.ovenType);

  let estimatedTime = input.ovenTime;
  estimatedTime *= category.baselineTimeFactor;
  estimatedTime *= fryerClass.timeMultiplier;
  estimatedTime *= stateMultipliers[state];
  estimatedTime *= getLoadMultiplier(basketLoad, fryerClass);

  if (category.supportsCrispness) {
    estimatedTime *= crispnessMultipliers[crispness];
  }

  estimatedTime *= getThicknessMultiplier(thickness, category);
  estimatedTime *= getWattageMultiplier(input.exactWattage);
  estimatedTime = Math.max(category.minimumCookTime, estimatedTime);

  const timeRange = buildTimeRange(estimatedTime, category.rangeSpread);
  const confidence = calculateConfidence(
    {
      ovenType: input.ovenType,
      basketLoad,
      categoryId: category.id,
      fryerClassId: fryerClass.id,
      state,
      thickness,
    },
    category,
    fryerClass,
  );

  return {
    normalizedOvenTemp,
    airFryerTemp: clampTemp(category.baselineAirFryerTemp),
    timeEstimate: estimatedTime,
    timeRange,
    checkAt: Math.max(1, timeRange.low - 1),
    agitation: resolveAgitationText(category),
    loadGuidance:
      basketLoad === 'single_layer'
        ? category.loadGuidance
        : `${describeLoadEffect(basketLoad)} ${category.batchGuidance}`,
    confidence,
    standTime:
      category.id === 'reheating_cooked_items'
        ? 'Let it stand for 1 minute if the centre is still catching up.'
        : undefined,
    notes: buildNotes(
      {
        basketLoad,
        ovenType: input.ovenType,
        exactWattage: input.exactWattage,
      },
      category,
      fryerClass,
      confidence,
    ),
  };
}
