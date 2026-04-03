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
const basketLoadHelpImage = {
  src: '/basket-load-example.png',
  alt: 'Comparison showing an air fryer basket that is too full beside a better single-layer basket setup.',
};

const initialFormValues: FormValues = {
  ovenTemp: '200',
  ovenTime: '20',
  ovenType: 'fan',
  categoryId: initialCategory,
  state: categoryProfileMap[initialCategory].defaultState,
  fryerClassId: 'drawer_standard',
  basketLoad: 'single',
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
          <h1>Turn pack instructions into practical air-fryer settings.</h1>
          <p className="lede">
            Enter the oven instructions from the pack, then get air-fryer settings with practical
            timing, basket guidance, and mid-cook reminders you can use straight away.
          </p>
        </div>

        <aside className="hero-note">
          <p className="eyebrow">Works Best For</p>
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
              Pick the closest supported food, enter the pack oven instructions, choose your fryer
              class, then set basket load so the result better reflects real airflow and crowding.
            </p>
          </div>
          <ConversionForm
            basketLoadHelpImage={basketLoadHelpImage}
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
          <p className="eyebrow">How It Works</p>
          <p>
            Time usually shifts more than temperature. The converter normalises fan vs
            conventional oven input, applies a food-type baseline, then layers on fryer class,
            basket load, crispness, thickness, and optional wattage adjustments.
          </p>
        </div>
        <div>
          <p className="eyebrow">Good To Know</p>
          <p>
            These settings are a practical guide, not a guarantee. The tool is designed for common
            packaged foods and straightforward reheating, not raw or safety-critical foods.
          </p>
        </div>
      </section>
    </div>
  );
}
