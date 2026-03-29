# AGENTS.md

## Purpose
This repository contains the v1 build of an oven-to-air-fryer conversion web app.

This file gives coding agents the working rules for how to behave in this repo.

Read this file first, then read:
1. `PROJECT_BRIEF.md`
2. `V1_SPEC.md`
3. `RULES_ENGINE_NOTES.md`

If those files conflict, priority order is:
1. `V1_SPEC.md`
2. `RULES_ENGINE_NOTES.md`
3. `PROJECT_BRIEF.md`

---

## Project objective
Build the smallest working v1 of a consumer web app that converts oven cooking instructions into air fryer instructions for selected food categories.

The app should be:
- simple
- practical
- explainable
- safe enough for supported categories
- easy to extend later

Do not treat this as a generic recipe app.
Do not treat this as a generic temperature calculator.

This project is specifically about:
- category-based conversion
- fryer-class adjustments
- clear output ranges
- practical cooking guidance
- conservative confidence messaging

---

## Scope discipline
Keep v1 narrow.

Do:
- build the working core flow
- support only the defined v1 categories
- use editable seed data
- keep the UI simple
- keep the rules engine testable

Do not:
- expand the scope without being asked
- add accounts, auth, databases, admin tools, OCR, barcode scanning, or ML
- create a giant fryer-model system in v1
- try to support every food type
- silently add risky raw-meat categories

If something seems useful but is outside v1, leave a clean hook for later rather than implementing it now.

---

## Source of truth
Use these files as the source of truth:

### `PROJECT_BRIEF.md`
Use for:
- overall product direction
- product principles
- target users
- safety mindset
- long-term project vision

### `V1_SPEC.md`
Use for:
- exact v1 behaviour
- supported inputs
- output requirements
- UX flow
- validation rules
- acceptance criteria

### `RULES_ENGINE_NOTES.md`
Use for:
- internal engine logic
- order of adjustments
- category baselines
- fryer-class logic
- confidence logic
- safety notes
- implementation guardrails

Do not invent alternative engine behaviour if these files already define it.

---

## Build philosophy
Prefer:
- small working increments
- clear file structure
- simple logic
- readable code
- deterministic behaviour
- explicit rules over hidden magic
- clean UI over flashy UI
- editable configuration over hardcoded scattered numbers

Avoid:
- overengineering
- premature abstraction
- clever but opaque logic
- fake precision
- hidden coupling between UI and engine logic

This project should be easy for a beginner to inspect and modify later.

---

## Rules engine requirements
The rules engine is the core of the product.

Treat it as a separate concern from the UI.

### Required behaviour
The engine must:
- normalise oven input
- resolve a category baseline
- resolve fryer-class adjustment
- apply state/load/crispness/thickness/wattage adjustments where relevant
- return a practical time range
- return method guidance
- return confidence
- return notes/safety messaging

### Important constraint
Do not collapse the logic into a single universal conversion formula.

This project explicitly assumes:
- different food categories need different baselines
- fryer class matters
- basket load matters
- uncertainty should be shown

---

## UI requirements
The first build should be a clean single-page app or similarly simple structure.

The UI should:
- let the user enter the required fields quickly
- clearly separate required inputs from advanced options
- produce a result immediately after submission
- present the output in plain English
- work well on mobile and desktop

- A reference image may be provided to guide the visual direction of the UI. Use it as aesthetic inspiration only for tone, spacing, rounded imagery, icon style, colour restraint, and overall polish. Do not copy its layout or product structure directly.

Do not:
- hide key inputs behind confusing UI
- overwhelm the user with too many controls
- expose internal engine details unless they help usability

---

## Design guardrails
This project should not look like a generic AI-generated app.

Use any provided reference images only as an aesthetic guide, not as a layout to copy.

What to borrow from the reference:
- light and airy visual feel
- mostly white or near-white backgrounds
- dark readable text
- elegant typography
- simple polished icons
- rounded imagery
- restrained colour palette
- soft premium consumer-app feel
- polished bottom navigation style where appropriate

What not to do:
- do not copy the template literally
- do not make this look like a recipe app
- do not make it look like a nutrition tracker
- do not use a generic SaaS dashboard style
- do not use typical AI-app gradients, neon accents, or glassmorphism-heavy design
- do not produce a default template/demo look

Adapt the visual language to this product:
- a conversion tool
- form-first interaction
- clear results display
- practical guidance
- mobile-friendly consumer UX

When making UI decisions, prioritise:
1. clarity
2. readability
3. visual restraint
4. consistent rounding and spacing
5. intentional consumer-app polish

If using imagery, use it sparingly and make it feel integrated into the design system.

---

## Output style requirements
Results should be readable and practical.

Good output style:
- `Air fry at 200°C for 10–12 minutes`
- `Check at 9 minutes`
- `Shake halfway through`
- `Cook in a single layer for best results`
- `If crowded, cook in batches`
- `Use this as a starting point and adjust if needed`

Avoid:
- decimals in user-facing times
- overconfident wording
- pseudo-scientific explanations
- saying results are guaranteed

---

## Safety and trust rules
This app must avoid misleading users.

Always preserve:
- confidence labels
- uncertainty messaging
- safety notes where specified
- conservative handling of low-confidence cases

Do not:
- imply that browning alone means food is safely cooked
- silently extend the app into unsupported risky categories
- remove warnings just to make the UI feel cleaner

If a feature would reduce trust or safety, do not add it without being asked.

---

## Data and configuration rules
Use structured, editable data for engine configuration.

Preferred patterns:
- `categoryProfiles`
- `fryerClassProfiles`
- `multipliers`
- `constants`
- pure functions for calculations

Avoid:
- magic numbers scattered across UI components
- duplicated category logic
- business logic directly embedded in presentation components

If possible, keep:
- seed data in JSON or typed config objects
- engine logic in dedicated modules
- UI components dumb/simple

---

## Testing expectations
Changes to the rules engine should be testable.

At minimum, maintain tests for:
- oven normalisation
- category baseline selection
- fryer-class adjustment
- state/load/crowding effects
- confidence calculation
- output range generation

If changing rule values or logic:
- update tests where appropriate
- avoid breaking the output shape

Do not skip tests for core engine behaviour unless explicitly told to.

---

## Implementation priorities
When building from scratch, work in this order:
1. scaffold the app
2. create the static seed/config data
3. implement the rules engine
4. implement the form
5. implement the result card
6. add confidence and safety messaging
7. add validation
8. add tests
9. polish UI and copy

Do not start with visual polish before the conversion flow works.

---

## Working style for agents
Before making major changes:
- read the relevant spec files
- summarise the intended change internally
- prefer the smallest working implementation first

When making changes:
- keep commits/files focused
- avoid unnecessary renaming
- avoid large refactors unless needed
- keep code easy to follow

If something is ambiguous:
- prefer the simplest interpretation consistent with the spec files
- do not invent extra product scope

---

## When uncertain
If a detail is not defined:
1. prefer a simple implementation
2. preserve current structure
3. leave clear comments or TODOs only if genuinely useful
4. do not invent advanced systems unless requested

Examples:
- use simple rule tables before complex inference systems
- use a small number of fryer classes before full model resolution
- use static seed data before adding persistence or external data fetching

---

## Future-friendly, but not future-heavy
Leave room for future additions such as:
- more food categories
- model example selector
- fuller fryer model dataset
- barcode scanning
- user calibration

But do not build those now unless explicitly asked.

The job is to ship a working v1, not to pre-build the whole roadmap.

---

## Final instruction
When in doubt, optimise for:
- clarity
- simplicity
- testability
- truthful output
- small working progress