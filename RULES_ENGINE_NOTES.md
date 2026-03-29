# RULES_ENGINE_NOTES.md

## Purpose
This file explains how the oven-to-air-fryer conversion engine should behave internally in v1.

It exists to stop the rules engine from becoming a vague or inconsistent collection of guesses.

This is not a marketing document. It is an internal working note for implementation.

The engine should remain:
- simple
- explainable
- testable
- easy to edit
- safe for the supported v1 categories

---

## Core principle
The conversion engine must **not** use one universal formula for all foods.

It should use a hybrid rules-based approach:

1. normalise the oven input
2. identify the food category
3. apply a category baseline
4. apply fryer-class adjustments
5. apply state/load/cut/crispness adjustments
6. output a practical range with method guidance
7. calculate confidence
8. add safety messaging where needed

The output is a **starting point**, not a promise of exact perfection.

---

## High-level engine flow

### Step 1: normalise oven input
The user may enter:
- oven temperature
- oven time
- oven type: fan or conventional

Internally, the engine should work from a **fan-equivalent baseline**.

Reason:
Many conversion tools become inconsistent because they do not normalise fan vs conventional oven instructions first.

### Normalisation rule for v1
Use a simple practical rule:
- if oven type is `fan`, keep temperature as-is
- if oven type is `conventional`, convert to a fan-equivalent baseline by subtracting `20°C`

Example:
- 200°C fan -> 200°C internal baseline
- 200°C conventional -> 180°C internal baseline

Notes:
- this is a simplification, but good enough for v1
- if future data suggests category-specific oven normalisation is needed, that can be added later

---

## Step 2: resolve category baseline
Each supported category should have a baseline profile.

The category baseline is the most important part of the engine.

A category profile should define:
- default air fryer temperature
- baseline time factor relative to fan-oven time
- time range width
- default agitation instruction
- whether stand time is common
- whether state affects timing
- whether crispness affects timing
- whether thickness/cut style affects timing
- baseline confidence level
- default safety note type

The baseline should come from static seed data, not from hardcoded scattered logic.

---

## Supported v1 categories
These are the intended v1 engine categories:

1. fries_chips_wedges
2. breaded_chicken_pieces
3. breaded_fish_seafood
4. party_snacks
5. simple_vegetable_sides
6. reheating_cooked_items

Optional subtypes may be added if they are easy to support:
- skinny_fries
- straight_cut_chips
- wedges
- crinkle_fries
- nuggets
- fish_fingers
- mozzarella_sticks
- spring_rolls
- pizza_snacks

Do not add too many subtypes if they make the UI or rules hard to maintain.

---

## Category baseline philosophy

### 1. fries_chips_wedges
This category is crisping-focused and highly sensitive to:
- cut style
- fryer power/class
- basket load
- shaking

General direction:
- air fryer temp often around `200°C`
- time often significantly lower than oven time
- shake halfway is usually required
- load sensitivity is high

Suggested baseline:
- default temp: `200`
- baseline time factor: `0.65`
- time range width: `±10%`
- agitation: `shake_halfway`
- stand time: `none`
- load sensitivity: `high`
- confidence base: `high`

Subtype direction:
- skinny fries: faster
- wedges: slower
- crinkle fries: slightly slower than skinny fries

### 2. breaded_chicken_pieces
This category includes nuggets, dippers, goujons, and similar products.

General direction:
- temp often around `180–190°C`
- time often around half to two-thirds of oven time
- turn or shake halfway is common
- crowding affects results a lot

Suggested baseline:
- default temp: `190`
- baseline time factor: `0.60`
- time range width: `±10%`
- agitation: `shake_or_turn_halfway`
- stand time: `none`
- load sensitivity: `medium_high`
- confidence base: `high`

### 3. breaded_fish_seafood
This includes fish fingers, breaded fillets, breaded prawns.

General direction:
- temp often around `180°C`
- coating browns quickly
- turn halfway is common
- time reduction can be meaningful but not always extreme

Suggested baseline:
- default temp: `180`
- baseline time factor: `0.65`
- time range width: `±10%`
- agitation: `turn_halfway`
- stand time: `none`
- load sensitivity: `medium`
- confidence base: `high`

### 4. party_snacks
This includes spring rolls, mozzarella sticks, mini pizzas, pizza pockets, similar frozen snacks.

General direction:
- temp often around `180–200°C`
- time often reduced substantially
- some products need stand time
- some risk surface browning too early

Suggested baseline:
- default temp: `180`
- baseline time factor: `0.60`
- time range width: `±12%`
- agitation: `turn_or_shake_halfway`
- stand time: `sometimes`
- load sensitivity: `medium`
- confidence base: `medium_high`

Subtype direction:
- mozzarella sticks: risk of leakage, may need stand time
- spring rolls: often fast, often need shaking
- mini pizzas / pizza snacks: may need turning rather than shaking

### 5. simple_vegetable_sides
This is lower-confidence than fries because vegetable size and moisture vary a lot.

General direction:
- smaller time reductions
- size variability matters more
- agitation often useful
- crispness is less predictable

Suggested baseline:
- default temp: `180`
- baseline time factor: `0.80`
- time range width: `±15%`
- agitation: `shake_or_turn_halfway`
- stand time: `none`
- load sensitivity: `medium`
- confidence base: `medium`

### 6. reheating_cooked_items
This category is broad and should stay conservative.

General direction:
- often much shorter than oven time
- must show “piping hot throughout”
- thickness matters
- load matters

Suggested baseline:
- default temp: `180`
- baseline time factor: `0.55`
- time range width: `±15%`
- agitation: `depends`
- stand time: `sometimes`
- load sensitivity: `medium`
- confidence base: `medium`

Important:
This category should usually include a reheating note, not just a crisping note.

---

## Step 3: fryer-class adjustments
The user-facing fryer class is a practical proxy for power, capacity, and form factor.

The engine should map the UI selection to an internal fryer-class profile.

### User-facing fryer classes
- Small compact drawer
- Standard drawer
- Large dual drawer / high power
- Oven-style / combi

### Internal fryer classes
Suggested internal IDs:
- `drawer_compact_low`
- `drawer_standard`
- `drawer_dual_high`
- `oven_or_combi_large`

### Fryer-class behaviour

#### drawer_compact_low
Typical traits:
- smaller basket
- more likely to crowd
- often lower or mid power
- slower if compared with large high-power models

Suggested multiplier:
- time multiplier: `1.10`

Meaning:
- increases cook time by 10% relative to baseline

Confidence effect:
- no penalty by default
- if load is crowded, apply stronger penalty because compact baskets are sensitive to overfilling

#### drawer_standard
Typical traits:
- common single-drawer baseline
- average size and performance

Suggested multiplier:
- time multiplier: `1.00`

Meaning:
- baseline class

Confidence effect:
- no adjustment

#### drawer_dual_high
Typical traits:
- larger capacity
- often higher wattage
- more forgiving batch size
- often faster than compact drawers

Suggested multiplier:
- time multiplier: `0.92`

Meaning:
- reduces cook time by about 8%

Confidence effect:
- slight increase in confidence for categories known to work well in drawers

#### oven_or_combi_large
Typical traits:
- larger cavity
- may not behave like compact basket fryers
- airflow behaviour may differ
- “large” does not always mean “faster”

Suggested multiplier:
- time multiplier: `0.98`

Meaning:
- nearly baseline, slightly faster only if the category suits it

Confidence effect:
- decrease confidence by one band or by score penalty
- reason: behaviour is less predictable than standard drawer classes

Important:
Do not assume bigger always means faster.
Form factor matters.

---

## Step 4: state adjustments
Food state should be an explicit adjustment.

Supported states:
- frozen
- chilled
- fresh

Not every category needs all states.

### Suggested v1 state adjustments
These are starting values only.

#### frozen
- baseline state for most packaged frozen categories
- multiplier: `1.00`

#### chilled
General direction:
- often faster than frozen
- slightly less time needed

Suggested multiplier:
- `0.90`

#### fresh
General direction:
- very category-dependent
- use cautiously
- can overbrown before centre is ready

Suggested multiplier:
- `0.95` for supported safer categories only

Important:
Fresh should not automatically be available for every category if that creates unsafe suggestions.

---

## Step 5: basket load adjustments
Basket load is a major practical variable.

Supported values:
- `single_layer`
- `some_overlap`
- `crowded`

### Suggested load multipliers

#### single_layer
- multiplier: `1.00`
- confidence impact: none

#### some_overlap
- multiplier: `1.15`
- confidence impact: small reduction

#### crowded
- multiplier: `1.30`
- confidence impact: moderate reduction
- show guidance: `Cook in batches for a better result`

Important:
Compact drawers should feel the effect of crowding more strongly than large dual-drawer units.

Optional later refinement:
Crowded multiplier can be slightly larger for `drawer_compact_low`.

---

## Step 6: crispness adjustments
Crispness should be optional and simple.

Supported values:
- `standard`
- `extra_crispy`

### Suggested crispness rules
For categories where crispness matters:
- increase time slightly for `extra_crispy`
- optionally increase temperature by a small amount for some categories, but keep v1 simple

Suggested v1 rule:
- `extra_crispy` => add `+8%` time
- keep temperature unchanged in v1

Reason:
Small time changes are easier to reason about than stacking time and temperature changes early.

Categories that should support crispness:
- fries_chips_wedges
- breaded_chicken_pieces
- breaded_fish_seafood
- party_snacks

Categories that may ignore crispness in v1:
- reheating_cooked_items
- some vegetable categories where it is too inconsistent

---

## Step 7: thickness / cut style adjustments
Thickness is important, but v1 should keep it simple.

Use only where it materially improves the category.

Suggested values:
- `thin`
- `standard`
- `thick`

### Suggested multipliers
- thin: `0.92`
- standard: `1.00`
- thick: `1.12`

Use cases:
- fries category
- reheating cooked items
- some party snacks

If thickness is not relevant to a category, ignore it.

---

## Step 8: exact wattage override
Exact wattage should be optional.

It should not replace fryer class entirely in v1 unless implemented carefully.

Recommended v1 behaviour:
- use fryer class as the main control
- if exact wattage is provided, apply a small adjustment on top or use it only to refine class confidence

Simple approach:
- under `1500W` => `+5%` time
- `1500W–1800W` => no change
- above `1800W` => `-5%` time

Important:
Do not let wattage create wild time swings in v1.
It is a useful proxy, not a full device simulation.

---

## Temperature logic
Time is the main thing that should vary.
Temperature should usually come from the category baseline.

### Temperature rules for v1
1. Resolve category baseline temperature
2. Optionally clamp to a sensible range
3. Avoid too many temperature adjustments in v1
4. Only use minor exceptions where strongly justified

Suggested safe clamp:
- minimum: `160°C`
- maximum: `205°C`

Reason:
v1 should avoid bizarre outputs caused by stacking too many adjustments.

### Simple temperature pattern by category
- fries_chips_wedges: usually `200°C`
- breaded_chicken_pieces: usually `190°C`
- breaded_fish_seafood: usually `180°C`
- party_snacks: usually `180°C`
- simple_vegetable_sides: usually `180°C`
- reheating_cooked_items: usually `180°C`

Future versions may allow category/subtype-specific temperature logic beyond this.

---

## Time calculation logic
The time engine should use a clear order.

### Proposed formula structure
1. start with oven time
2. if oven type is conventional, convert temp only, not time
3. get category baseline time factor
4. multiply by fryer-class multiplier
5. multiply by state multiplier
6. multiply by load multiplier
7. multiply by crispness multiplier if used
8. multiply by thickness multiplier if used
9. multiply by exact wattage multiplier if provided
10. round to a practical range

### Practical example
If:
- oven time = 20
- category factor = 0.65
- fryer class = 0.92
- frozen = 1.00
- load = 1.15
- extra crispy = 1.08

Then:
`20 × 0.65 × 0.92 × 1.00 × 1.15 × 1.08`

Then convert that result into:
- central estimated time
- display range
- early check time

---

## Output range logic
The app should not show one exact minute unless the number is very short and obvious.

### Recommended output behaviour
1. calculate a central estimated time
2. create a display range around it
3. create an early-check point slightly before the lower edge

### Suggested v1 method
- central estimate = computed result
- lower bound = round down to nearest whole minute, around `-8%`
- upper bound = round up to nearest whole minute, around `+8%`
- check-at = lower bound minus 1 minute, minimum 1 minute

Example:
- central estimate = 10.8
- output range = `10–12 minutes`
- check at = `9 minutes`

For very short times:
- keep ranges readable
- avoid nonsense like `2–2 minutes`

Example:
- if estimate is 4.2, show `4–5 minutes`

---

## Agitation logic
Method guidance matters and should be category-driven.

Suggested instruction values:
- `shake_halfway`
- `turn_halfway`
- `shake_or_turn_halfway`
- `usually_no_agitation`
- `depends`

### Default mapping
- fries_chips_wedges -> `shake_halfway`
- breaded_chicken_pieces -> `shake_or_turn_halfway`
- breaded_fish_seafood -> `turn_halfway`
- party_snacks -> `turn_or_shake_halfway`
- simple_vegetable_sides -> `shake_or_turn_halfway`
- reheating_cooked_items -> `depends`

If the category uses agitation, the result card should always show it.

---

## Stand-time logic
Some foods benefit from a short stand after cooking.

Suggested v1 stand-time categories:
- mozzarella sticks
- pizza pockets
- filled snacks
- some reheated items

Suggested stand-time output:
- `Stand for 1–2 minutes before eating`

If the subtype is not known, do not guess stand time unless the category strongly implies it.

---

## Confidence logic
Confidence should be simple and explainable.

Use either:
- a numeric score that maps to High / Medium / Low
or
- direct rule bands

Recommended v1: numeric score

### Suggested starting score
Start at `100`

### Suggested deductions
- oven type conventional converted: `-5`
- fryer class `oven_or_combi_large`: `-15`
- food category `simple_vegetable_sides`: `-10`
- food category `reheating_cooked_items`: `-10`
- basket load `some_overlap`: `-10`
- basket load `crowded`: `-20`
- fresh state where category is weakly supported: `-10`
- no subtype where subtype would help: `-5`
- thickness omitted where relevant: `-5`

### Suggested boosts
- frozen packaged category with strong baseline: `+5`
- fryer class known and non-combi: `+5`

### Suggested mapping
- `85+` => High confidence
- `65–84` => Medium confidence
- below `65` => Low confidence

Confidence reasons should be human-readable.

Examples:
- `High confidence: common frozen category with a known fryer class`
- `Medium confidence: results may vary because the basket is crowded`
- `Low confidence: oven-style fryer and variable food category`

---

## Safety messaging rules
The app must behave conservatively.

### Always show a soft safety reminder
For all categories:
- `Use this as a starting point and adjust if needed`

### Reheating category
Always show:
- `Ensure food is piping hot throughout`

### Low confidence result
Show:
- `Results may vary more than usual for this combination`

### Future risky categories
If risky raw categories are added later, require:
- low confidence by default
- thermometer guidance
- stronger warnings

Do not silently extend v1 rules into risky raw categories.

---

## Rounding rules
The engine should round for human readability.

### Suggested rules
- final temperature: whole number in °C
- final time range: whole minutes
- check-at: whole minutes
- avoid decimals in final UI

Internally, decimals are fine.
UI output should feel practical.

---

## Data structure guidance
The rules engine should use editable data, not scattered magic numbers.

Suggested data modules:
- `categoryProfiles`
- `fryerClassProfiles`
- `stateMultipliers`
- `loadMultipliers`
- `thicknessMultipliers`
- `wattageAdjustmentRules`

This should make it easy to:
- inspect
- test
- tune
- extend

---

## Pseudocode sketch

```text
function convert(input):
  normalizedTemp = normalizeOvenTemp(input.ovenTemp, input.ovenType)

  category = getCategoryProfile(input.category, input.subtype)
  fryerClass = getFryerClassProfile(input.fryerClass)

  temp = category.defaultAirFryerTemp

  time = input.ovenTime
  time *= category.baselineTimeFactor
  time *= fryerClass.timeMultiplier
  time *= getStateMultiplier(input.state, category)
  time *= getLoadMultiplier(input.load, fryerClass)
  time *= getCrispnessMultiplier(input.crispness, category)
  time *= getThicknessMultiplier(input.thickness, category)
  time *= getWattageMultiplier(input.exactWattage)

  time = applyMinMaxGuards(time, category)

  resultRange = buildTimeRange(time)
  checkAt = buildCheckAt(resultRange)

  agitation = resolveAgitation(category, input.subtype)
  standTime = resolveStandTime(category, input.subtype)

  confidence = calculateConfidence(input, category, fryerClass)

  notes = buildNotes(input, category, fryerClass, confidence)

  return {
    normalizedTemp,
    airFryerTemp: temp,
    timeRange: resultRange,
    checkAt,
    agitation,
    standTime,
    confidence,
    notes
  }