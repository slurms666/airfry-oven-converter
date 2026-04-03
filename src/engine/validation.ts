import { categoryProfileMap } from '../data/categoryProfiles';
import type { FormValues, ValidationErrors } from '../types';

function parseNumber(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function validateForm(values: FormValues): ValidationErrors {
  const errors: ValidationErrors = {};
  const ovenTemp = parseNumber(values.ovenTemp);
  const ovenTime = parseNumber(values.ovenTime);
  const exactWattage = parseNumber(values.exactWattage);
  const category = categoryProfileMap[values.categoryId];

  if (ovenTemp === undefined) {
    errors.ovenTemp = 'Enter the oven temperature from the pack or recipe.';
  } else if (ovenTemp < 100 || ovenTemp > 260) {
    errors.ovenTemp = 'Use a sensible range between 100°C and 260°C.';
  }

  if (ovenTime === undefined) {
    errors.ovenTime = 'Enter the oven time in minutes.';
  } else if (ovenTime < 1 || ovenTime > 240) {
    errors.ovenTime = 'Use a sensible range between 1 and 240 minutes.';
  }

  if (values.exactWattage.trim() !== '') {
    if (exactWattage === undefined || exactWattage <= 0) {
      errors.exactWattage = 'Exact wattage must be a positive number if you use it.';
    }
  }

  if (!category.supportedStates.includes(values.state)) {
    errors.ovenTime = errors.ovenTime ?? 'Pick a food state that matches the selected category.';
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function toOptionalNumber(value: string): number | undefined {
  const parsed = parseNumber(value);
  return parsed === undefined ? undefined : parsed;
}
