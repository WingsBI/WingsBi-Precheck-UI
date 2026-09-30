# Component Architecture & Reuse Rules

## Before writing any UI code
- Search `src/components/ui/` for an existing component BEFORE writing new markup.
- Do not create new markup that duplicates an existing component's function.
- If unsure whether a component exists, list the contents of `src/components/ui/` first.

## Buttons & Actions
- Use shared button wrapper components (e.g. `<ActionButton>`) instead of raw MUI `<Button>` blocks.
- **Standard tier** (`size="standard"`): height 38px, horizontal padding 16px, border radius 6px, font size 0.82rem — used for primary header actions, filter bar triggers, form submission buttons.
- **Compact tier** (`size="compact"`): height 34px, horizontal padding 14px, border radius 6px, font size 0.8rem — used for tight table action bars or secondary toolbars.
- Variants: `primary` (solid brand purple — Save/Submit/Apply/Add), `secondary` (outlined/neutral — Cancel/Export/Clear), `danger` (red — Delete/Revoke).

## Forms & Input Validation
- Use `<FormTextField>` / `<FormAutocomplete>` for form fields so required-field asterisks display consistently.

## Page Layout & Navigation
- Every main page must use a unified `<PageHeader title="..." subtitle="..." actions={...} />` component.
- Wrap data tables and filter bars inside surface cards (Paper / TableCard) with 1px solid #EAECF0 borders and subtle box shadows.
- Use Material UI flex layouts (Stack, Box, Grid) with responsive breakpoints (xs, sm, md, lg) — no fixed-width layouts that break on resize.

## Code Hygiene & DRY Principle
- If the same UI pattern appears 2+ times across pages, extract it into `src/components/ui/` instead of copy-pasting.
- If an inline `sx` block exceeds 5 lines and is reused anywhere, extract it into a shared wrapper component or theme style utility.
- Remove unused imports, icons, dialogs, and styling utilities before finishing a page.
- Prefer extending an existing component via props/variants over creating a near-duplicate component.

## Exceptions
<!-- List any files/pages that intentionally deviate from these rules and why, e.g.: -->
<!-- - GenerateIRMSN.tsx, BarcodeGeneration.tsx — multi-step generators with custom flow controls -->

## Self-check before finishing any page/feature
- List which reusable components were used.
- Confirm no raw HTML (raw `<button>`, `<div>` cards, etc.) duplicates an existing component's job.
- If a new component was created, confirm it doesn't already exist elsewhere in `src/components/ui/` first.
