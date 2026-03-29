import type React from 'react';
import { categoryProfiles } from '../data/categoryProfiles';
import { fryerClassProfiles } from '../data/fryerClassProfiles';
import type {
  CategoryProfile,
  FormValues,
  ValidationErrors,
} from '../types';

interface ConversionFormProps {
  values: FormValues;
  errors: ValidationErrors;
  selectedCategory: CategoryProfile;
  onFieldChange: <K extends keyof FormValues>(field: K, value: FormValues[K]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const ovenTypes = [
  { value: 'fan', label: 'Fan oven' },
  { value: 'conventional', label: 'Conventional oven' },
] as const;

const loadOptions = [
  { value: 'single_layer', label: 'Single layer' },
  { value: 'some_overlap', label: 'Some overlap' },
  { value: 'crowded', label: 'Crowded' },
] as const;

const crispnessOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'extra_crispy', label: 'Extra crispy' },
] as const;

const thicknessOptions = [
  { value: 'thin', label: 'Thin' },
  { value: 'standard', label: 'Standard' },
  { value: 'thick', label: 'Thick' },
] as const;

function SegmentedButtons<T extends string>(props: {
  legend: string;
  name: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="field-group">
      <legend>{props.legend}</legend>
      <div className="segment-row">
        {props.options.map((option) => (
          <label
            key={option.value}
            className={`segment ${props.value === option.value ? 'segment-active' : ''}`}
          >
            <input
              checked={props.value === option.value}
              name={props.name}
              onChange={() => props.onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ConversionForm({
  values,
  errors,
  selectedCategory,
  onFieldChange,
  onSubmit,
}: ConversionFormProps) {
  return (
    <form className="converter-form" onSubmit={onSubmit}>
      <section className="form-section">
        <div className="section-header">
          <p className="eyebrow">Step 1</p>
          <h2>Pick the food you are looking at</h2>
        </div>
        <div className="category-grid">
          {categoryProfiles.map((category) => (
            <label
              key={category.id}
              className={`choice-card ${values.categoryId === category.id ? 'choice-card-active' : ''}`}
            >
              <input
                checked={values.categoryId === category.id}
                name="categoryId"
                onChange={() => onFieldChange('categoryId', category.id)}
                type="radio"
                value={category.id}
              />
              <span className="choice-title">{category.shortLabel}</span>
              <span className="choice-copy">{category.examples}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="form-section">
        <div className="section-header">
          <p className="eyebrow">Step 2</p>
          <h2>Enter the pack or recipe oven instructions</h2>
        </div>
        <div className="number-grid">
          <label className="field">
            <span>
              Oven temperature ({'\u00b0'}C)
            </span>
            <input
              inputMode="numeric"
              onChange={(event) => onFieldChange('ovenTemp', event.target.value)}
              placeholder="200"
              type="number"
              value={values.ovenTemp}
            />
            {errors.ovenTemp ? <small className="error">{errors.ovenTemp}</small> : null}
          </label>

          <label className="field">
            <span>Oven time (minutes)</span>
            <input
              inputMode="numeric"
              onChange={(event) => onFieldChange('ovenTime', event.target.value)}
              placeholder="20"
              type="number"
              value={values.ovenTime}
            />
            {errors.ovenTime ? <small className="error">{errors.ovenTime}</small> : null}
          </label>
        </div>

        <SegmentedButtons
          legend="Oven type"
          name="ovenType"
          onChange={(value) => onFieldChange('ovenType', value)}
          options={ovenTypes}
          value={values.ovenType}
        />

        <SegmentedButtons
          legend="Food state"
          name="state"
          onChange={(value) => onFieldChange('state', value)}
          options={selectedCategory.supportedStates.map((state) => ({
            value: state,
            label: state.charAt(0).toUpperCase() + state.slice(1),
          }))}
          value={values.state}
        />
      </section>

      <section className="form-section">
        <div className="section-header">
          <p className="eyebrow">Step 3</p>
          <h2>Choose the fryer class</h2>
        </div>
        <div className="fryer-grid">
          {fryerClassProfiles.map((profile) => (
            <label
              key={profile.id}
              className={`choice-card fryer-card ${values.fryerClassId === profile.id ? 'choice-card-active' : ''}`}
            >
              <input
                checked={values.fryerClassId === profile.id}
                name="fryerClassId"
                onChange={() => onFieldChange('fryerClassId', profile.id)}
                type="radio"
                value={profile.id}
              />
              <span className="choice-title">{profile.label}</span>
              <span className="choice-copy">{profile.example}</span>
            </label>
          ))}
        </div>
      </section>

      <details className="advanced-panel">
        <summary>More options</summary>
        <div className="advanced-content">
          <SegmentedButtons
            legend="Basket load"
            name="basketLoad"
            onChange={(value) => onFieldChange('basketLoad', value)}
            options={loadOptions}
            value={values.basketLoad}
          />

          {selectedCategory.supportsCrispness ? (
            <SegmentedButtons
              legend="Crispness"
              name="crispness"
              onChange={(value) => onFieldChange('crispness', value)}
              options={crispnessOptions}
              value={values.crispness}
            />
          ) : null}

          {selectedCategory.supportsThickness ? (
            <SegmentedButtons
              legend={selectedCategory.thicknessLabel ?? 'Thickness'}
              name="thickness"
              onChange={(value) => onFieldChange('thickness', value)}
              options={thicknessOptions}
              value={values.thickness}
            />
          ) : null}

          <label className="field">
            <span>Exact wattage, if you know it</span>
            <input
              inputMode="numeric"
              onChange={(event) => onFieldChange('exactWattage', event.target.value)}
              placeholder="1700"
              type="number"
              value={values.exactWattage}
            />
            {errors.exactWattage ? (
              <small className="error">{errors.exactWattage}</small>
            ) : (
              <small className="hint">Optional. This only nudges the time slightly in v1.</small>
            )}
          </label>
        </div>
      </details>

      <button className="primary-button" type="submit">
        Convert to air fryer settings
      </button>
    </form>
  );
}
