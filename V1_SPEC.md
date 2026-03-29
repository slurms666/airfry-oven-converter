# V1_SPEC.md

## Purpose
Define the exact scope and behaviour for version 1 of the Oven to Air Fryer Converter web app.

This file is the practical product specification for the first working build.

The goal of v1 is not to solve every cooking conversion problem. The goal is to ship a small, usable, believable version that gives helpful starting-point conversions for selected food categories using a rules-based approach.

---

## V1 objective
Build a simple web app where a user can enter oven cooking instructions and receive a practical air fryer conversion result.

The result should include:
- air fryer temperature
- air fryer time range
- a recommended early-check time
- method guidance such as shake or turn halfway
- simple load guidance
- confidence level
- safety notes where relevant

---

## V1 success criteria
V1 is successful if a user can:
1. choose a supported food category
2. enter basic oven cooking instructions
3. choose a fryer class
4. receive a clear air fryer result in seconds
5. understand the result without extra explanation

V1 should feel:
- fast
- simple
- practical
- trustworthy
- not overengineered

---

## Explicit non-goals for v1
Do not do these in v1:
- support every food type
- support barcode scanning
- support OCR from packaging photos
- support user accounts
- support saved history
- support model-specific calibration
- support exact brand/model matching for all fryers
- support raw-meat-heavy advanced safety workflows
- use machine learning
- build a large admin system
- create a giant product database before the core app works

---

## Supported food categories in v1

### High-priority supported categories
1. Frozen fries / chips / wedges
2. Frozen breaded chicken pieces
   - nuggets
   - dippers
   - goujons
3. Frozen breaded fish / seafood
   - fish fingers
   - breaded prawns
   - breaded fillets
4. Frozen party snacks
   - spring rolls
   - mozzarella sticks
   - mini pizzas
   - pizza pockets
5. Selected vegetable sides with published air fryer guidance
6. Reheating already-cooked items

### Optional supported subtypes
If implementation is simple, category selection may include subtypes such as:
- skinny fries
- straight-cut chips
- wedges
- crinkle fries
- chicken nuggets
- fish fingers
- mozzarella sticks
- spring rolls
- pizza snacks

These subtypes should only be included if they improve the baseline logic and do not overcomplicate the UI.

### Out of scope or low-confidence in v1
- raw poultry pieces
- thick raw meats
- burgers and minced meats
- stuffed foods
- mixed ready meals
- dense cook-through foods where internal temperature is safety-critical
- very wet or highly variable foods
- baked goods requiring more complex baking logic

These may be excluded from the UI or shown with a low-confidence warning if included later.

---

## Required user inputs

### Required fields
1. **Oven temperature**
   - numeric input
   - unit: Celsius only for v1

2. **Oven time**
   - numeric input in minutes

3. **Oven type**
   - fan
   - conventional

4. **Food category**
   - dropdown or segmented selection

5. **Food state**
   - frozen
   - chilled
   - fresh
   - where not relevant, default intelligently or hide

6. **Air fryer class**
   - Small compact drawer
   - Standard drawer
   - Large dual drawer / high power
   - Oven-style / combi

### Optional fields
These can be placed under “More options” or “Advanced options”:
1. **Basket load**
   - single layer
   - some overlap
   - crowded

2. **Crispness**
   - standard
   - extra crispy

3. **Thickness / cut style**
   - only where relevant to category

4. **Exact wattage**
   - optional numeric field
   - only used if provided

---

## Default behaviour
If optional fields are not filled in:
- basket load defaults to `single layer`
- crispness defaults to `standard`
- thickness defaults to category baseline
- exact wattage is ignored unless entered

The app should still return a result with sensible defaults.

---

## Output specification

### Primary output
The main result card should show:
1. **Air fryer temperature**
   - single value in °C

2. **Air fryer cook time**
   - displayed as a range
   - example: `10–12 minutes`

3. **Check at**
   - example: `Check at 9 minutes`

### Secondary output
The result should also show:
- `Shake halfway` or `Turn halfway` or `No agitation usually needed`
- `Cook in a single layer for best results`
- `Cook in batches if crowded`
- `Stand for 1–2 minutes` where relevant

### Confidence output
Display one of:
- High confidence
- Medium confidence
- Low confidence

Include a short plain-English reason, for example:
- `High confidence: common frozen category with known fryer class`
- `Medium confidence: fryer class is known but basket load may affect result`
- `Low confidence: category is variable or key details are unknown`

### Safety / guidance output
Conditionally show:
- `Use this as a starting point and adjust if needed`
- `Ensure food is piping hot throughout`
- `For safety-sensitive foods, use a thermometer`
- `If the outside browns too fast, lower the temperature slightly and cook for longer`

---

## UX flow

### Main happy path
1. User lands on homepage
2. User sees a short explanation and the form
3. User chooses food category
4. User enters oven temp and time
5. User selects oven type
6. User selects food state
7. User selects air fryer class
8. User optionally opens advanced options
9. User clicks `Convert`
10. User sees result card immediately

### UX goals
- no account required
- no unnecessary text
- obvious form flow
- mobile friendly
- minimal friction
- clear visual separation between inputs and result

---

## Validation rules

### Oven temperature
- required
- must be a positive number
- sensible allowed range for v1: 100–260°C
- if outside range, show validation warning

### Oven time
- required
- must be a positive number
- sensible allowed range for v1: 1–240 minutes

### Food category
- required

### Oven type
- required

### Air fryer class
- required

### Food state
- required if category uses it
- otherwise can default

### Optional fields
- exact wattage must be positive if entered
- if exact wattage conflicts strongly with chosen fryer class, optionally show a note but do not block submission

---

## Engine behaviour overview
The engine should work in this order:

1. **Normalise oven input**
   - convert conventional oven input into an internal fan-equivalent baseline if needed

2. **Resolve category profile**
   - load category baseline from data/config

3. **Resolve fryer class profile**
   - apply fryer-class adjustment

4. **Apply state adjustment**
   - frozen / chilled / fresh

5. **Apply optional adjustments**
   - basket load
   - crispness
   - thickness/cut style
   - exact wattage if supplied

6. **Generate output**
   - final temperature
   - final time range
   - check-at time
   - method instructions
   - confidence level
   - safety notes

---

## V1 engine philosophy
The v1 engine should be:
- rule-based
- transparent
- easy to edit
- easy to test
- based on category baselines and simple multipliers
- not dependent on ML or external APIs

The engine should not try to simulate cooking physics precisely.

It should produce a defensible practical estimate.

---

## Category profile structure
Each food category should have a profile containing fields similar to:

- category id
- display name
- default air fryer temperature
- baseline time factor relative to fan oven time
- default agitation instruction
- default load assumption
- supports crispness adjustment: yes/no
- supports thickness adjustment: yes/no
- state adjustment values
- fryer-class multipliers
- load multipliers
- safety flags
- confidence base level

---

## Example category baselines
These are example placeholders for v1 logic. Final values can be adjusted later.

### Fries / chips / wedges
- air fryer temp baseline: 200°C
- time factor baseline: 0.60 to 0.75 depending on subtype
- agitation: shake halfway
- crispness adjustment: yes
- load sensitivity: high

### Breaded chicken pieces
- air fryer temp baseline: 180–190°C
- time factor baseline: 0.50 to 0.70
- agitation: turn or shake halfway
- load sensitivity: medium-high

### Breaded fish / seafood
- air fryer temp baseline: 180°C
- time factor baseline: 0.55 to 0.75
- agitation: turn halfway
- load sensitivity: medium

### Party snacks
- air fryer temp baseline: 180–200°C depending on subtype
- time factor baseline: 0.50 to 0.75
- agitation: turn or shake halfway depending on subtype
- stand time may apply

### Reheating cooked items
- baseline varies
- often shorter times
- must show “piping hot throughout” reminder
- confidence lower when thickness is unknown

These are seed assumptions, not permanent truths.

---

## Fryer classes

### User-facing fryer classes
1. Small compact drawer
2. Standard drawer
3. Large dual drawer / high power
4. Oven-style / combi

### Internal class behaviour
Each class should map to internal values such as:
- time multiplier
- crowding sensitivity
- load assumptions
- confidence adjustment

Example direction:
- small compact drawer: slightly slower, more crowding sensitivity
- standard drawer: baseline
- large dual drawer/high power: slightly faster
- oven-style/combi: lower confidence unless tuned specifically

---

## Confidence rules
Confidence should be calculated using a simple scoring system.

### Example factors that increase confidence
- supported frozen category
- fryer class known
- standard load
- common category subtype
- simple conversion path

### Example factors that reduce confidence
- oven-style/combi fryer
- crowded basket
- food state unknown
- variable / broad category
- unsupported or borderline food type
- missing optional info that matters for that category

### Suggested mapping
- score high enough -> High confidence
- middle -> Medium confidence
- low -> Low confidence

Exact scoring can be implemented simply in code.

---

## Safety rules
The app must be conservative.

### Mandatory safety behaviour
- avoid giving high confidence on risky categories
- warn users that browning does not always mean safely cooked
- show “ensure piping hot throughout” for reheating and selected frozen foods
- show thermometer guidance if risky categories are ever allowed

### V1 recommendation
Exclude or suppress high-risk raw categories from the main flow for now.

---

## Copy requirements

### Good result tone
The copy should be:
- plain English
- practical
- calm
- not overly technical
- not overconfident

### Example output copy
- `Air fry at 200°C for 10–12 minutes`
- `Check at 9 minutes`
- `Shake halfway through`
- `Cook in a single layer for the best result`
- `If crowded, cook in batches`
- `Use this as a starting point and adjust if needed`

### Avoid
- fake precision like `10.3 minutes`
- scientific jargon unless needed
- overpromising language like `perfect conversion guaranteed`

---

## UI requirements

### Pages
V1 can be a single-page app with:
- hero/header
- short explanation
- conversion form
- results card
- optional small help section

### Recommended sections
1. Title and short description
2. Input form
3. Advanced options accordion
4. Result panel
5. Small disclaimer/help text

### Mobile requirements
- form must work cleanly on mobile
- result must be readable without horizontal scrolling
- primary CTA must remain obvious

---

## UI and visual design direction
The interface should feel clean, light, and polished.

Desired visual qualities:
- light overall UI
- white or near-white backgrounds
- dark text with strong readability
- elegant fonts with a modern consumer-app feel
- simple, refined iconography
- rounded corners used consistently
- rounded imagery where imagery is used
- restrained use of accent colour
- premium but calm visual tone
- mobile-friendly layout with strong hierarchy

The design should avoid common AI-generated app habits.

Avoid:
- generic blue/purple AI gradients
- glassmorphism-heavy cards
- glowing effects
- flashy futuristic styling
- cluttered dashboards
- obvious default Tailwind/shadcn demo-page aesthetics
- chatbot-like layouts
- overdesigned “AI tool” visuals

The product should feel more like a well-designed consumer mobile app than a startup SaaS dashboard.

## Layout guidance
The form and result should be the visual focus of the app.

Recommended layout characteristics:
- generous spacing
- readable typography hierarchy
- clear card separation
- soft rounded containers
- simple visual grouping
- minimal friction between input and result
- bottom navigation on mobile if appropriate to the chosen structure

If a bottom menu is used, it should feel polished and integrated, inspired by modern consumer apps:
- visually balanced
- easy to scan
- not oversized
- rounded or softly framed if that fits the design system
- styled with restraint

Do not copy the structure of a recipe app directly.
Use these layout qualities only where they improve this conversion tool.

## Design adaptation rule
Use the reference app template as inspiration for visual language only:
- light aesthetic
- typography
- icons
- colour balance
- rounded imagery
- bottom menu style

Do not copy:
- exact screens
- exact app structure
- exact content blocks
- exact navigation architecture

The final design must be original and adapted specifically for an oven-to-air-fryer converter.

---

## Technical requirements

### App structure
Separate:
- UI components
- rules engine logic
- static seed data
- utility functions
- tests

### Data storage
Use local static files for v1:
- JSON or TS objects are acceptable

### Testing
At minimum, create tests for:
- oven normalisation logic
- fryer-class adjustment logic
- category baseline resolution
- final output shape
- confidence calculation
- a few known example conversions

---

## Error handling
If the input is invalid:
- show inline form validation
- do not crash
- do not produce nonsense output

If a category is unsupported:
- clearly say it is not yet supported in v1

If confidence is low:
- still return a starting-point result where appropriate
- explain that the result may vary more than usual

---

## Initial implementation priorities
Build in this order:

1. App scaffold
2. Form UI
3. Static category data
4. Static fryer-class data
5. Rules engine
6. Result card
7. Confidence logic
8. Validation
9. Tests
10. Polish and copy cleanup

---

## Acceptance criteria
V1 is ready when:
- the form works
- supported categories return a result
- fryer class affects the result
- output includes time, temp, check-at, and guidance
- confidence level is shown
- obvious invalid inputs are handled
- core rules are covered by tests
- the interface is clean and understandable

---

## Future hooks
The code should leave room for later additions:
- model example selector
- full model database
- barcode scanning
- richer product/category dataset
- calibration flow
- saved preferences
- mobile app reuse

V1 should not implement these yet, but should avoid making them hard later.