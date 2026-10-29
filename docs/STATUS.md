# Project Status

Last updated: 2026-10-27 · Branch: `block-system`

## Start here (new session)

Read `AGENTS.md`, `CODE_RULES.md`, then the docs your task touches:
`docs/PRD.md`, `docs/block-system-plan.md`, `docs/i18n-plan.md`, `docs/auth-billing-plan.md`.

## Done

| Milestone | What | Commit |
|---|---|---|
| Cleanup | Stale docs and build output removed, Agenvo source moved to `theme-sources/agenvo/`, old DB sites deleted | `6252c42` |
| M1 | Block catalog (18 blocks, fixtures, `needs` rules) + two-language `SiteContent` schema, `npm run check:blocks` | `7a133d1` |
| A1 + D1 | better-auth email/password, one site per account (`ownerId` unique, 409), owner checks on site APIs + preview, dashboard shows user name | (this commit) |
| M2 | Agenvo theme (18 blocks, `data-block` roots, RTL, `headExtra` hook) + `render-site.ts` + `npm run check:theme` | (this commit) |
| M3 | `buildFacts(brief, projects)` + rules-only composition (About/Projects need a fact block), `npm run check:composition` | (this commit) |
| Q1 | System tests: `npm test` (pipeline, 13) + `npm run test:api` (HTTP on :3100, `_test` DB, AI disabled, 6) | (this commit) |
| M4 | Live pipeline on blocks (compose → save → renderSite), old templates/editor deleted, edit page shows upgrade notice, +4 API tests | (this commit) |
| M5 | AI copy per block: strict per-block output schema, contract tests (no AI), pre-flight, spend guard (abort + call budget), diagnostics, `rewriteBlocks` for C1; old content reads as draft | (this commit) |
| I1 | App UI in English and Arabic (next-intl, `/en` + `/ar`, RTL, switcher, API error codes), `npm run check:messages` | `cd8392e` |

## Next, in order

Full order in `docs/features-v2-plan.md`:

1. **M6** Pexels images (`docs/block-system-plan.md`); M8 wizard fields after
2. **U1** S3 uploads → **P1** projects → **E1** new editor (replaces M7) → **S1** SEO → **C1** AI credits → **T1** tracking → **G1** tutorials
3. **B1**: Polar trial + subscription, any time after A1

## Current state of the app

- The landing page, dashboard and wizard work in both languages. They still use the **old** fixed
  Agenvo content model, because the block system isn't wired in until M4.
- The editor (`/[locale]/edit/[siteId]`) works but its text is English only, until M7.
- From M4 until M7 the editor will be broken. This is expected.

## Open decisions (owner)

- After the trial ends without payment: should **preview** stay available, or be locked too?
  (The current plan keeps preview and locks editing + AI.)
- Review the Arabic in `src/messages/ar.json`. It was written by an AI agent (incl. new `auth.*` keys) and `site-creation/composition/labels.ts` (generated-site labels).
- Composition drops projects without an image and awards without a year (catalog needs them). P1/M6 must give projects an image (customer photo or Pexels).
- Seed now needs a user id: `npm run seed:site -- <userId>`. One old site without `ownerId` remains in the DB (unreachable; safe to delete).

## Working notes

- Checks: `npm run lint`, `npx tsc --noEmit`, `npx tsc -p tsconfig.generator.json --noEmit`,
  `npm run check:blocks`, `npm run check:messages`, `npm run check:theme`, `npm run check:composition`, `npm run build`, `npm test`, `npm run test:api` (after build; uses port 3100 and a `_test` DB; never calls AI).
- Delegation used the OpenCode lane `saas` (local machine only; config in `~/.config/delegate-skills/`).
- `.env` is not in git. Copy `.env.example` and fill in the values on a new machine.
