import type React from 'react';
import { useState } from 'react';
import { ConversionForm } from './components/ConversionForm';
import { ResultCard } from './components/ResultCard';
import { categoryProfileMap } from './data/categoryProfiles';
import { convertOvenToAirFryer } from './engine/convert';
import {
  hasValidationErrors,
  toOptionalNumber,
  validateForm,
} from './engine/validation';
import type { FormValues, ConversionResult, ValidationErrors } from './types';

const initialCategory = 'fries_chips_wedges' as const;

const initialFormValues: FormValues = {
  ovenTemp: '200',
  ovenTime: '20',
  ovenType: 'fan',
  categoryId: initialCategory,
  state: categoryProfileMap[initialCategory].defaultState,
  fryerClassId: 'drawer_standard',
  basketLoad: 'single_layer',
  crispness: 'standard',
  thickness: 'standard',
  exactWattage: '',
};

export default function App() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<ConversionResult | null>(null);

  const selectedCategory = categoryProfileMap[formValues.categoryId];

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setFormValues((current) => {
      const nextValues: FormValues = {
        ...current,
        [field]: value,
      };

      if (field === 'categoryId') {
        const nextCategory = categoryProfileMap[value as FormValues['categoryId']];
        nextValues.state = nextCategory.supportedStates.includes(current.state)
          ? current.state
          : nextCategory.defaultState;

        if (!nextCategory.supportsCrispness) {
          nextValues.crispness = 'standard';
        }

        if (!nextCategory.supportsThickness) {
          nextValues.thickness = 'standard';
        }
      }

      return nextValues;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(formValues);
    setErrors(nextErrors);

    if (hasValidationErrors(nextErrors)) {
      setResult(null);
      return;
    }

    const category = categoryProfileMap[formValues.categoryId];
    const nextResult = convertOvenToAirFryer({
      ovenTemp: Number(formValues.ovenTemp),
      ovenTime: Number(formValues.ovenTime),
      ovenType: formValues.ovenType,
      categoryId: formValues.categoryId,
      state: category.supportedStates.includes(formValues.state)
        ? formValues.state
        : category.defaultState,
      fryerClassId: formValues.fryerClassId,
      basketLoad: formValues.basketLoad,
      crispness: category.supportsCrispness ? formValues.crispness : undefined,
      thickness: category.supportsThickness ? formValues.thickness : undefined,
      exactWattage: toOptionalNumber(formValues.exactWattage),
    });

    setResult(nextResult);
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Oven to Air Fryer Converter</p>
          <h1>Turn pack instructions into a sensible air-fryer starting point.</h1>
          <p className="lede">
            Use the oven instructions on the pack as your starting point, then convert them with
            category-based rules, fryer-class adjustments, and practical guidance you can follow
            straight away.
          </p>
        </div>

        <aside className="hero-note">
          <p className="eyebrow">Supported v1 scope</p>
          <ul>
            <li>Frozen fries, chips, and wedges</li>
            <li>Frozen breaded chicken pieces</li>
            <li>Frozen breaded fish and seafood</li>
            <li>Frozen party snacks</li>
            <li>Simple vegetable sides</li>
            <li>Reheating already-cooked items</li>
          </ul>
        </aside>
      </header>

      <main className="workspace">
        <section className="tool-panel">
          <div className="panel-intro">
            <p className="eyebrow">Converter</p>
            <h2>Practical first, with the core inputs kept up front.</h2>
            <p>
              Pick the closest supported food, enter the pack oven instructions, then refine the
              result only if basket load, crispness, cut style, or wattage matter for your setup.
            </p>
          </div>
          <ConversionForm
            errors={errors}
            onFieldChange={updateField}
            onSubmit={handleSubmit}
            selectedCategory={selectedCategory}
            values={formValues}
          />
        </section>

        <ResultCard result={result} />
      </main>

      <section className="help-strip">
        <div>
          <p className="eyebrow">Why it behaves this way</p>
          <p>
            Time changes more than temperature in v1. The converter normalises fan vs
            conventional oven input, applies a category baseline, then layers on fryer class,
            load, crispness, thickness, and optional wattage adjustments.
          </p>
        </div>
        <div>
          <p className="eyebrow">Trust boundary</p>
          <p>
            This is a starting point, not a guarantee. Unsupported risky raw-food categories are
            intentionally left out of the main flow.
          </p>
        </div>
      </section>
    </div>
  );
}
