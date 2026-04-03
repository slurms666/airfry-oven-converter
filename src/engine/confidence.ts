import type {
  BasketLoad,
  BasketLoadSensitivity,
  CategoryProfile,
  ConfidenceResult,
  ConversionInput,
  FryerClassProfile,
} from '../types';

const overlapPenaltyBySensitivity: Record<BasketLoadSensitivity, number> = {
  low: 5,
  medium: 8,
  high: 10,
};

const packedPenaltyBySensitivity: Record<BasketLoadSensitivity, number> = {
  low: 12,
  medium: 18,
  high: 24,
};

function mapScoreToLevel(score: number): ConfidenceResult['level'] {
  if (score >= 85) {
    return 'high';
  }

  if (score >= 65) {
    return 'medium';
  }

  return 'low';
}

function buildReason(
  level: ConfidenceResult['level'],
  positives: string[],
  cautions: string[],
): string {
  if (level === 'high') {
    return positives[0] ?? 'Common food type with a straightforward conversion path.';
  }

  if (level === 'medium') {
    const caution = cautions.slice(0, 2).join(' ');
    return caution || 'This combination has a few variables, so treat it as a starting point.';
  }

  return cautions.slice(0, 2).join(' ') || 'This combination is more variable than the core frozen categories.';
}

export function calculateConfidence(
  input: Required<Pick<ConversionInput, 'ovenType' | 'basketLoad' | 'categoryId' | 'fryerClassId'>> &
    Pick<ConversionInput, 'state' | 'thickness'>,
  category: CategoryProfile,
  fryerClass: FryerClassProfile,
): ConfidenceResult {
  let score = 100 + category.confidenceAdjustment + fryerClass.confidenceAdjustment;
  const positives: string[] = [];
  const cautions: string[] = [];

  if (input.ovenType === 'conventional') {
    score -= 5;
    cautions.push('The oven instruction needed a fan-equivalent adjustment first.');
  }

  if (input.basketLoad === 'overlap') {
    score -= overlapPenaltyBySensitivity[category.basketLoadSensitivity];
    cautions.push('Slight overlap cuts down airflow, so timing can stretch a little.');
  }

  if (input.basketLoad === 'packed') {
    score -= packedPenaltyBySensitivity[category.basketLoadSensitivity];
    cautions.push('A packed basket reduces airflow, so the result can vary more and usually takes longer.');
  }

  if (
    input.basketLoad === 'packed' &&
    input.fryerClassId === 'drawer_compact_low'
  ) {
    score -= 8;
    cautions.push('Compact drawers are especially sensitive when the basket is packed.');
  }

  if (category.id === 'simple_vegetable_sides') {
    cautions.push(category.variabilityNote ?? 'Vegetable size and moisture can vary.');
  }

  if (category.id === 'reheating_cooked_items') {
    cautions.push(category.variabilityNote ?? 'Reheating varies with thickness.');
  }

  if (input.state === 'fresh' && category.id !== 'simple_vegetable_sides') {
    score -= 10;
    cautions.push('Fresh items in this category are more variable than the frozen baseline.');
  }

  if (input.fryerClassId === 'oven_or_combi_large') {
    cautions.push('Oven-style air fryers often behave less predictably than drawer models.');
  }

  if (category.frozenConfidenceBoost && input.state === 'frozen') {
    score += 5;
    positives.push('Common frozen category with strong air-fryer patterns.');
  }

  if (input.fryerClassId !== 'oven_or_combi_large') {
    score += 5;
    positives.push('Known drawer-style fryer class keeps the estimate more grounded.');
  }

  if (category.supportsThickness && input.thickness === undefined) {
    score -= 5;
    cautions.push('Thickness affects this category, so timing may move slightly.');
  }

  score = Math.max(0, Math.min(score, 100));

  const level = mapScoreToLevel(score);

  return {
    score,
    level,
    reason: buildReason(level, positives, cautions),
  };
}

export function describeLoadEffect(load: BasketLoad): string {
  if (load === 'packed') {
    return 'Packed basket.';
  }

  if (load === 'overlap') {
    return 'Slight overlap.';
  }

  return 'Best airflow.';
}
