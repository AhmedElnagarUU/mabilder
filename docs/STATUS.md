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
| I1 | App UI in English and Arabic (next-intl, `/en` + `/ar`, RTL, switcher, API error codes), `npm run check:messages` | `cd8392e` |

## Next, in order

1. **A1**: better-auth, one site per account (`docs/auth-billing-plan.md`)
2. **M2**: Agenvo theme + renderer + `check-theme` (`docs/block-system-plan.md`)
3. **M3** composition → **M4** switch pipeline → **M5** AI copy → **M6** Pexels → **M7** editor → **M8** wizard fields
4. **B1**: Polar trial + subscription, any time after A1

## Current state of the app

- The landing page, dashboard and wizard work in both languages. They still use the **old** fixed
  Agenvo content model, because the block system isn't wired in until M4.
- The editor (`/[locale]/edit/[siteId]`) works but its text is English only, until M7.
- From M4 until M7 the editor will be broken. This is expected.

## Open decisions (owner)

- After the trial ends without payment: should **preview** stay available, or be locked too?
  (The current plan keeps preview and locks editing + AI.)
- Review the Arabic in `src/messages/ar.json`. It was written by an AI agent.

## Working notes

- Checks: `npm run lint`, `npx tsc --noEmit`, `npx tsc -p tsconfig.generator.json --noEmit`,
  `npm run check:blocks`, `npm run check:messages`, `npm run build`.
- Delegation used the OpenCode lane `saas` (local machine only; config in `~/.config/delegate-skills/`).
- `.env` is not in git. Copy `.env.example` and fill in the values on a new machine.
