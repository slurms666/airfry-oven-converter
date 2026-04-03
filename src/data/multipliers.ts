import type { Crispness, FoodState, Thickness } from '../types';

export const stateMultipliers: Record<FoodState, number> = {
  frozen: 1,
  chilled: 0.9,
  fresh: 0.95,
};

export const crispnessMultipliers: Record<Crispness, number> = {
  standard: 1,
  extra_crispy: 1.08,
};

export const thicknessMultipliers: Record<Thickness, number> = {
  thin: 0.92,
  standard: 1,
  thick: 1.12,
};

export const temperatureClamp = {
  min: 160,
  max: 205,
};
