import { categoryProfileMap } from '../data/categoryProfiles';
import { convertOvenToAirFryer, normalizeOvenTemp } from './convert';

describe('normalizeOvenTemp', () => {
  it('keeps fan oven input unchanged', () => {
    expect(normalizeOvenTemp(200, 'fan')).toBe(200);
  });

  it('converts conventional oven input to a fan-equivalent baseline', () => {
    expect(normalizeOvenTemp(200, 'conventional')).toBe(180);
  });
});

describe('convertOvenToAirFryer', () => {
  it('uses the category baseline for fries in a standard drawer', () => {
    const result = convertOvenToAirFryer({
      ovenTemp: 200,
      ovenTime: 20,
      ovenType: 'fan',
      categoryId: 'fries_chips_wedges',
      state: 'frozen',
      fryerClassId: 'drawer_standard',
      basketLoad: 'single_layer',
      crispness: 'standard',
      thickness: 'standard',
    });

    expect(result.airFryerTemp).toBe(200);
    expect(result.timeRange).toEqual({
      low: 12,
      high: 14,
      label: '12-14 minutes',
    });
    expect(result.recommendedCookMinutes).toBe(13);
    expect(result.actionType).toBe('shake');
    expect(result.actionTimes).toEqual([390]);
    expect(result.actionSummary).toBe('Shake at 6:30');
    expect(result.checkAt).toBe(11);
    expect(result.agitation).toBe('Shake halfway through');
    expect(result.confidence.level).toBe('high');
  });

  it('makes compact crowded baskets slower than dual drawers', () => {
    const compact = convertOvenToAirFryer({
      ovenTemp: 200,
      ovenTime: 20,
      ovenType: 'fan',
      categoryId: 'breaded_chicken_pieces',
      state: 'frozen',
      fryerClassId: 'drawer_compact_low',
      basketLoad: 'crowded',
      crispness: 'standard',
    });

    const dual = convertOvenToAirFryer({
      ovenTemp: 200,
      ovenTime: 20,
      ovenType: 'fan',
      categoryId: 'breaded_chicken_pieces',
      state: 'frozen',
      fryerClassId: 'drawer_dual_high',
      basketLoad: 'single_layer',
      crispness: 'standard',
    });

    expect(compact.timeEstimate).toBeGreaterThan(dual.timeEstimate);
    expect(compact.confidence.level).toBe('medium');
  });

  it('reduces time for chilled reheating and adds the reheating safety note', () => {
    const result = convertOvenToAirFryer({
      ovenTemp: 190,
      ovenTime: 12,
      ovenType: 'fan',
      categoryId: 'reheating_cooked_items',
      state: 'chilled',
      fryerClassId: 'drawer_standard',
      basketLoad: 'single_layer',
      thickness: 'thin',
    });

    expect(result.timeEstimate).toBeLessThan(12);
    expect(result.actionType).toBe('check');
    expect(result.actionTimes.length).toBe(1);
    expect(result.notes).toContain('Ensure the food is piping hot throughout before serving.');
    expect(result.standTime).toBeDefined();
  });

  it('keeps supported state defaults aligned with the category profile', () => {
    expect(categoryProfileMap.simple_vegetable_sides.defaultState).toBe('fresh');
    expect(categoryProfileMap.reheating_cooked_items.supportedStates).toEqual([
      'chilled',
      'frozen',
    ]);
  });

  it('drops confidence for oven-style fryers in variable categories', () => {
    const result = convertOvenToAirFryer({
      ovenTemp: 200,
      ovenTime: 18,
      ovenType: 'conventional',
      categoryId: 'simple_vegetable_sides',
      state: 'fresh',
      fryerClassId: 'oven_or_combi_large',
      basketLoad: 'crowded',
      thickness: 'thick',
    });

    expect(result.confidence.level).toBe('low');
    expect(result.notes).toContain('Results may vary more than usual for this combination.');
  });
});
