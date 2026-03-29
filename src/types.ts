export type OvenType = 'fan' | 'conventional';
export type CategoryId =
  | 'fries_chips_wedges'
  | 'breaded_chicken_pieces'
  | 'breaded_fish_seafood'
  | 'party_snacks'
  | 'simple_vegetable_sides'
  | 'reheating_cooked_items';
export type FoodState = 'frozen' | 'chilled' | 'fresh';
export type FryerClassId =
  | 'drawer_compact_low'
  | 'drawer_standard'
  | 'drawer_dual_high'
  | 'oven_or_combi_large';
export type BasketLoad = 'single_layer' | 'some_overlap' | 'crowded';
export type Crispness = 'standard' | 'extra_crispy';
export type Thickness = 'thin' | 'standard' | 'thick';
export type AgitationId =
  | 'shake_halfway'
  | 'turn_halfway'
  | 'shake_or_turn_halfway'
  | 'turn_or_shake_halfway'
  | 'usually_no_agitation'
  | 'depends';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConversionInput {
  ovenTemp: number;
  ovenTime: number;
  ovenType: OvenType;
  categoryId: CategoryId;
  state?: FoodState;
  fryerClassId: FryerClassId;
  basketLoad?: BasketLoad;
  crispness?: Crispness;
  thickness?: Thickness;
  exactWattage?: number;
}

export interface CategoryProfile {
  id: CategoryId;
  label: string;
  shortLabel: string;
  blurb: string;
  examples: string;
  supportedStates: FoodState[];
  defaultState: FoodState;
  baselineAirFryerTemp: number;
  baselineTimeFactor: number;
  rangeSpread: number;
  minimumCookTime: number;
  agitation: AgitationId;
  supportsCrispness: boolean;
  supportsThickness: boolean;
  thicknessLabel?: string;
  loadGuidance: string;
  batchGuidance: string;
  confidenceAdjustment: number;
  frozenConfidenceBoost: boolean;
  pipingHotNote: boolean;
  browningCaution: boolean;
  variabilityNote?: string;
}

export interface FryerClassProfile {
  id: FryerClassId;
  label: string;
  blurb: string;
  example: string;
  timeMultiplier: number;
  confidenceAdjustment: number;
  loadAdjustments: Partial<Record<BasketLoad, number>>;
}

export interface ConfidenceResult {
  score: number;
  level: ConfidenceLevel;
  reason: string;
}

export interface ConversionResult {
  normalizedOvenTemp: number;
  airFryerTemp: number;
  timeEstimate: number;
  timeRange: {
    low: number;
    high: number;
    label: string;
  };
  checkAt: number;
  agitation: string;
  loadGuidance: string;
  standTime?: string;
  confidence: ConfidenceResult;
  notes: string[];
}

export interface ValidationErrors {
  ovenTemp?: string;
  ovenTime?: string;
  exactWattage?: string;
}

export interface FormValues {
  ovenTemp: string;
  ovenTime: string;
  ovenType: OvenType;
  categoryId: CategoryId;
  state: FoodState;
  fryerClassId: FryerClassId;
  basketLoad: BasketLoad;
  crispness: Crispness;
  thickness: Thickness;
  exactWattage: string;
}
