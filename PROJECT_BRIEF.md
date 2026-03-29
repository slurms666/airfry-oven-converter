# PROJECT_BRIEF.md

## Project name
Oven to Air Fryer Converter

## Project goal
Build a consumer-facing web app that converts oven cooking instructions into air fryer cooking instructions as reliably as possible.

The product should help users enter standard oven instructions from food packaging or recipes and receive a practical air fryer alternative that is more accurate than generic “reduce temperature and reduce time” calculators.

This project should be built with a safety-first mindset. The app must avoid false precision, especially for foods where undercooking could be unsafe.

## Product vision
The long-term goal is to create a reliable oven-to-air-fryer conversion engine that can power:
- a consumer website
- later an Android app
- later an iOS app

## Visual direction
This product should feel intentionally designed and consumer-friendly, not like a generic AI-generated tool or a default SaaS dashboard.

The visual direction should take inspiration from polished mobile consumer apps with a light, clean, premium feel.

Key qualities:
- light and airy overall appearance
- mostly light backgrounds
- black or very dark text for clarity
- restrained, clean colour palette
- rounded imagery and rounded visual elements where appropriate
- elegant typography with clear hierarchy
- simple, polished icons
- soft, modern card styling
- calm, premium, friendly feel without looking childish

The goal is not to copy a recipe or nutrition app literally, but to borrow broad visual strengths that work well across many consumer app types:
- rounded pictures
- clean spacing
- strong readability
- gentle visual warmth
- good icon use
- a polished bottom navigation style on mobile

The final product should feel like a real designed app, not an AI-generated template.

# BUILD_STAGES.md

## Current workflow

Do not skip ahead unnecessarily.
If the current stage requires a small dependency from another stage, implement only the minimum needed to support the current stage.
Do not expand into the full later stage unless explicitly asked.
If you need to do this, explain what you are pulling forward and why.

Work in this stage order by default.

- [x] Stage 1 — Understand the project
- [ ] Stage 2 — Scaffold the app
- [ ] Stage 3 — Define the data model
- [ ] Stage 4 — Build the rules engine
- [ ] Stage 5 — Add tests for the engine
- [ ] Stage 6 — Build the input form UI
- [ ] Stage 7 — Build the results UI
- [ ] Stage 8 — Connect the form to the engine
- [ ] Stage 9 — Apply the visual design direction
- [ ] Stage 10 — Final cleanup and review

The immediate goal is a useful, testable website v1.

## Core product idea
A single universal conversion formula is likely too simplistic.

The app should use a hybrid approach:
- category-based conversion baselines
- rule-based adjustments
- fryer-class adjustments
- confidence scoring
- practical cooking guidance such as shaking, turning, checking early, and batch cooking warnings

The app should provide a recommended starting point, not pretend to guarantee perfect results in every case.

## Key product principles
1. Keep v1 simple, but genuinely useful.
2. Prefer clear ranges over fake exactness.
3. Be transparent about uncertainty.
4. Prioritise high-confidence food categories first.
5. Show practical method instructions, not just time and temperature.
6. Avoid unsafe guidance for raw or difficult foods.
7. Build the engine so it can improve over time with better data.

## Problem being solved
Most existing oven-to-air-fryer converters are too generic. They often apply the same reduction rule to all foods, even though real-world products behave very differently.

Examples:
- thin fries do not convert the same way as thick wedges
- breaded fish does not convert the same way as filled pastries
- lower-power compact fryers do not behave the same as large dual-drawer models
- crowded baskets can significantly change results

The app should produce better recommendations by combining food category logic with fryer-class and cooking-condition adjustments.

## Target users
Primary users:
- everyday home cooks
- people reading oven instructions from frozen food packaging
- users who want quick and practical air fryer settings without having to guess

Likely user characteristics:
- not technical
- wants a fast answer
- may not know exact fryer wattage
- may only know their fryer roughly by size or model
- may want “standard” or “extra crispy” results

## Intended v1 scope
The first version should focus on food categories with:
- relatively strong packaging/manufacturer guidance
- lower safety risk
- repeatable air fryer patterns

Recommended v1 categories:
- frozen fries / chips / wedges
- frozen breaded chicken pieces such as nuggets and dippers
- frozen breaded fish and seafood such as fish fingers and breaded prawns
- frozen party snacks such as spring rolls, mozzarella sticks, mini pizzas, pizza pockets
- selected simple vegetable sides with published air fryer guidance
- reheating already-cooked items where air fryer use is common

Categories to defer, exclude, or mark low-confidence in v1:
- raw poultry pieces
- thick raw meats
- burgers and minced meat products
- stuffed foods
- mixed ready meals
- foods where internal temperature safety is critical and results vary widely

## How the app should work
The user enters basic cooking information, and the app returns:
- recommended air fryer temperature
- recommended time range
- early check point
- method guidance such as shake halfway / turn halfway
- load guidance such as cook in batches
- confidence level
- safety notes where needed

The output should feel practical and readable, like something a real person can follow immediately while cooking.

## Core input philosophy
The app should ask for the smallest number of inputs needed to produce a useful result.

Required inputs for v1:
- oven temperature
- oven time
- oven type: fan or conventional
- food category
- food state: frozen / chilled / fresh where relevant
- fryer type/class

Optional inputs for v1 or “advanced options”:
- basket load: single layer / some overlap / crowded
- crispness preference: standard / extra crispy
- thickness or cut style where relevant
- exact wattage if known

## Fryer-class concept
Users should not be forced to know their exact model or wattage.

The UI should allow users to choose a simple fryer class with example models underneath.

Proposed user-facing fryer classes:
- Small compact drawer
- Standard drawer
- Large dual drawer / high power
- Oven-style / combi

These classes should map internally to capacity, wattage, form factor, and a default time multiplier.

## Conversion engine direction
The engine should not be a single formula.

It should work like this:
1. Normalise the oven input
2. Identify the food category
3. Load a category baseline
4. Apply adjustments for fryer class
5. Apply adjustments for load / crispness / thickness where relevant
6. Return a time range, not a single exact number
7. Return method instructions and confidence messaging

## Tone and UX expectations
The app should feel:
- simple
- trustworthy
- practical
- non-technical
- not overconfident

The copy should avoid sounding scientific for the sake of it.
The app should explain uncertainty in plain English.

Examples of good output language:
- “Cook at 200°C for 10–12 minutes”
- “Check at 9 minutes”
- “Shake halfway through”
- “Cook in a single layer for best results”
- “If crowded, cook in batches”
- “Use this as a starting point and adjust if needed”

## Safety expectations
The app must avoid giving unsafe confidence.

Rules:
- high-risk categories should either be excluded from v1 or clearly marked low confidence
- the app should not imply that browning alone means food is cooked safely
- where relevant, the app should advise checking internal temperature or ensuring food is piping hot throughout
- the app should avoid pretending that all air fryers behave the same

## Data direction
This project is expected to grow over time.

The long-term engine should be informed by:
- packaging that includes both oven and air fryer instructions
- manufacturer cooking guidance
- category-specific patterns
- fryer-class behaviour
- later, model-specific or user-calibrated adjustments

For v1, the goal is not perfection. The goal is a sensible, explainable, testable first engine.

## Technical intention
The codebase should be structured so that:
- rules are easy to inspect and edit
- food categories can be expanded later
- fryer classes can be expanded later
- seed data can later be replaced or supplemented by a richer dataset
- the rules engine is testable
- the UI and engine logic are separated cleanly

## What success looks like for v1
A user can:
1. open the site
2. enter oven instructions and food type
3. choose a fryer class
4. get a useful conversion result in seconds
5. understand what to do without extra explanation

A successful v1 should be:
- usable
- believable
- clear
- safe enough for supported categories
- easy to improve after testing

## What not to do
- do not build a giant perfect database before the first working version exists
- do not try to support every food in v1
- do not hide uncertainty
- do not use a single generic conversion rule for all categories
- do not overcomplicate the UI
- do not optimise for edge cases before the basic flow works

## Current build priority
Build the smallest working version of the app with:
- a clean UI
- a small set of supported food categories
- fryer-class selection
- a first-pass rules engine
- explainable output
- seed data stored in a simple editable format
- tests for core conversion logic

## Expected next files
This file provides the high-level project context.

Related files:
- `V1_SPEC.md` for more exact product requirements
- `RULES_ENGINE_NOTES.md` for engine logic, assumptions, and internal structure