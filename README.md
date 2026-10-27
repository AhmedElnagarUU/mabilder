# nextbuilder

A website builder for architecture, interior design, decoration, and construction businesses.
The customer describes their business, adds what they have (logo, projects, team, …), and gets
a finished static website they can edit.

## Docs

- `docs/PRD.md`: what the product is and who it's for
- `docs/block-system-plan.md`: how sites are built from blocks, plus the milestones
- `docs/i18n-plan.md`: Arabic/English for the app UI and the generated websites
- `docs/auth-billing-plan.md`: accounts (better-auth) and paid plans (Polar)
- `CODE_RULES.md`: rules every change must follow
- `AGENTS.md`: instructions for AI agents working in this repo

## Folders

```text
src/app/                 routes only (pages + API route handlers)
src/features/            one folder per feature (owns its components, logic, types)
src/shared/              code used by 2+ features (db connection, UI primitives)
scripts/                 CLI scripts (compiled with tsconfig.generator.json)
theme-sources/<name>/    original HTML/CSS templates, input for theme import
docs/                    product and technical docs
docs/app-ui-reference/   design reference for the app's own UI
generated-sites/         generated output (git-ignored)
```

## Run

```bash
cp .env.example .env     # fill in the values
npm install
npm run dev
```

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
