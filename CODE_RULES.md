# CODE_RULES.md

**Every agent or sub-agent must read this file in full before writing or modifying any code.**

---

## 0. Current project status

Some sections below describe the target stack. These parts are **not set up yet**. Do not add them
unless your task explicitly says so:

- S3 uploads

Features v2 (uploads, projects, new editor, SEO, AI credits, tracking, tutorials) are planned in
`docs/features-v2-plan.md`. Where it disagrees with older plans, it wins.

Auth (better-auth) and Polar billing are planned in `docs/auth-billing-plan.md` (milestones A1, B1).
Until A1 lands, site APIs have no session check. Do not add one in unrelated tasks.

## 1. KISS: Keep It Simple

- Code must be simple enough to read and review with zero ambiguity about what is right or wrong.
- No clever abstractions, no premature generalization, no "frameworks inside the framework".
- Optimize for readability over cleverness. If two implementations exist, pick the boring one.
- Do not add comments explaining obvious code; write code so obvious it needs no comments.

## 2. Feature-based structure: never organize by file type

The codebase is organized by **feature/module**, not by technical type.

```text
src/
  app/                          routes only: page.tsx, layout.tsx, route.ts
  features/
    <feature>/
      components/               React components of this feature
      model.ts                  Mongoose schema/model (if it persists data)
      repository.ts             data access through model.ts
      service.ts                feature logic called by routes
      types.ts                  zod schemas + inferred types
      <sub-area>/               group related files when the feature grows
  shared/
    db/                         MongoDB connection, db error helpers
    ui/                         generic UI primitives (button, field, card, icon, logo)
scripts/                        CLI entry points (compiled with tsconfig.generator.json)
theme-sources/<name>/           original HTML/CSS templates (input for theme import, never imported by code)
docs/                           PRD, plans, design references
```

- Each feature owns its components, hooks, API logic, schemas, and types under `src/features/<feature>/`.
- A route file in `src/app/**` must contain no business logic: parse request → call feature function → return response.
- `src/shared/` holds **generic, domain-free** code only (db connection, UI primitives). Domain code
  (blocks, themes, site content, briefs) stays in its feature, even when another feature uses it.
- A feature may import another feature's **types, schemas, and public functions** (e.g. `site-creation`
  imports the block catalog from `static-site-generator`). Imports go one way: never create a cycle
  between two features.
- Any feature can be understood, modified, or removed without breaking unrelated features.

## 3. One responsibility per function

- Each function does exactly one thing.
- Related functions stay grouped together in the same module. Do not scatter them.
- No giant inline blocks inside route handlers or components; extract named functions.
- There is no hard line-count limit, but if a file becomes hard to follow, split it along feature/responsibility lines.

## 4. No new dependencies without approval

You must NOT add any npm package that is not on the approved list below. If you believe a new dependency is required, STOP and flag it for explicit human approval instead of installing it.

**Approved dependencies (the full baseline):**

| Package | Purpose |
|---|---|
| `next`, `react`, `react-dom` | App framework (Next.js App Router) |
| `tailwindcss` | Styling |
| `next-intl` | i18n (EN/AR locales, RTL) |
| `better-auth` | Authentication |
| `mongoose` | Official MongoDB driver |
| `zod` | Request/schema validation |
| `@aws-sdk/client-s3` | S3 API access |
| `@aws-sdk/s3-request-presigner` | Presigned upload URLs |
| `@polar-sh/sdk` | Polar payment provider integration |
| `lucide-react` | Icons |
| `@langchain/core`, `@langchain/google-genai`, `@langchain/openai` | AI calls (`site-creation/generation`; OpenRouter through `@langchain/openai`) |

External HTTP APIs (e.g. Pexels) are called with the built-in `fetch`. Never add an SDK package for them.

Dev tooling: `typescript`, `eslint`, `@types/*`. Nothing else without approval.

## 5. File/function length: guideline, not hard limit

No numeric limit is enforced. The test: if a file stops being easy to scan top-to-bottom, split it along feature/responsibility lines.

## 6. i18n & RTL by default

Full design: `docs/i18n-plan.md`.

- **Exception (owner decision 2026-10-29):** the owner-only admin area (§9) is **English only** and does not use translations. Customer-facing text (including notifications and emails) still follows the rule below.
- **No hardcoded user-facing strings. Ever.** All text renders through the translation layer (`next-intl`). Add every key to BOTH `src/messages/en.json` and `src/messages/ar.json`. They must always have the same keys (`npm run check:messages`).
- Keys are namespaced by feature (`common`, `landing`, `dashboard`, `siteCreation`, `editor`).
- Arabic translations: if the task provides them, use them verbatim. Otherwise write natural Modern Standard Arabic and list every new key in your report so a human can review it.
- The product UI supports `en` and `ar` locales from day one. Routes are prefixed: `/en/...`, `/ar/...`. The `<html>` element gets `lang` and `dir="rtl"` for Arabic.
- i18n setup lives in `src/shared/i18n/`. Internal links use `Link`/`useRouter` from `src/shared/i18n/navigation.ts`, never `next/link` directly.
- Next 16 calls middleware "proxy": the locale middleware is `src/proxy.ts`.
- `src/app/api/**` and `src/app/preview/**` are not localized. API errors return a stable `code`; the UI translates the code.
- Layout must not break in RTL: always use CSS logical properties (Tailwind: `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`, `start-0`, `end-0`). NEVER use directional properties (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `text-left`, `text-right`, `left-0`, `right-0`) in layout-critical styles. Icons with direction (arrows) must flip via `rtl:rotate-180`.
- Business-language rule: user-facing labels never use web-design terminology ("component", "grid", "section container", "breakpoint"). In the editor UI, call blocks "sections" only if no better business word exists.
- This section covers **the app's own UI**. Generated customer websites are not translated through `next-intl`: each site has one `locale`, the AI writes its copy in that language, and themes must render correctly in RTL (logical CSS, `dir` set by the theme document).

## 7. Stack conventions (binding)

- **Next.js App Router + TypeScript.** Server Components by default; `"use client"` only where interactivity requires it.
- **No Server Actions.** Do not use Next.js Server Actions under any circumstance. All API endpoints and mutations must be implemented as route handlers (`route.ts`) under `src/app/api/**` exclusively. Every endpoint path is defined in the task file. Do not invent different paths.
- **mongoose** through the shared connection singleton in `src/shared/db/`. Each feature that persists data must define a `model.ts` beside its `repository.ts`, with a Mongoose schema and model for every collection it writes. Repositories must write through that model so MongoDB-bound data is validated at runtime; TypeScript interfaces remain the source of static typing. Validate external input with `zod` at API boundaries.
- **Auth** via better-auth (email/password), session cookie based. Every owner-scoped API must verify the session and that `site.ownerId === session.user.id`; otherwise return `401` (no session) or `404` (not owner).
- **Auth code** lives in `src/features/auth/`. Pages and APIs check the session on the server
  (`requireSession`). The proxy cookie check is only a fast redirect, never the security check.
- **Polar**: the webhook (signature verified with `POLAR_WEBHOOK_SECRET`) is the only source of truth
  for a user's subscription. Access (`trial` / `active` / `expired`) comes only from
  `src/features/billing/access.ts` and is enforced on the server; `expired` returns `402` with
  `code: "subscription_required"`. One website per account (`409 site_exists`). AI is limited by daily
  credits (`src/features/credits/`): 20 per rolling 24 hours, 1 per rewritten section, the first
  generation of a site is free, failed AI calls are not charged (`429 credits_exhausted`).
- **S3**: presigned PUT uploads from the browser; objects are served from the bucket's public base URL (`S3_PUBLIC_BASE_URL`). Key pattern: `sites/{siteId}/{slotId}/{uuid}.{ext}`; payment screenshots (slot `payments`, no site needed) use `users/{userId}/payments/{uuid}.{ext}`.
- **Env vars** are documented in `.env.example` (names only). Never commit real secrets.
- **Static generator code** (`src/features/static-site-generator/**`, `src/features/site-creation/**`
  non-component files, `scripts/**`) must also compile with `tsconfig.generator.json` (CommonJS, no
  `@/` path aliases, use relative imports).

## 8. Block system rules

Full design: `docs/block-system-plan.md`.

- **Catalog vs theme.** The block catalog (`static-site-generator/blocks/`) defines each block's data
  (zod schema, kind, needs, fixtures). Themes (`static-site-generator/themes/<id>/`) only render.
  A theme never adds or renames props. A new block type is a catalog change and needs human approval.
- **Facts are never written by AI.** `fact` blocks get their data from code (facts built from the
  brief). AI output is only accepted for `copy` block props and is validated with the block's zod schema.
- **A fact block never renders without its facts.** Its `needs(facts)` check decides it.
- **All dynamic output is escaped** with the helpers in `static-site-generator/content/html.ts`
  (`renderText`, `escapeAttribute`). Never interpolate raw strings into HTML.
- **Every block's root element** is `<section data-block="{blockId}" …>`.
- **No hardcoded template copy** in theme render files. All visible text comes from props.
- Composition (which blocks and pages) is **pure rules**: no AI, no IO, deterministic for the same input.

## 9. Admin area: isolated, owner permission required

The owner-only admin area is a separate system inside the app (owner decision 2026-10-29).

- **Do not touch it.** No agent may create, change or delete anything in the admin area unless the owner
  explicitly names the admin task in the request and gives permission. If a task seems to need an admin
  change, stop and ask the owner.
- **Where it lives (all of it, and nothing else):** `src/features/admin/` (logic, admin auth, UI components),
  `src/app/[locale]/admin/` (pages), `src/app/api/admin/` (route handlers). No admin code anywhere else.
- **Own login, not better-auth.** Credentials come only from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`,
  `ADMIN_SESSION_SECRET`). Signing in creates an admin session (signed, HTTP-only cookie) that **expires
  after 5 hours**. The admin is not a user in the database and has no customer account.
- **Dependency direction:** admin code may import and call the other features' services (sites, activity,
  billing, notifications…). **Other features never import from admin.**
- **The one allowed hook outside admin:** the customer auth/session code (`src/features/auth/`) reads an
  account-status flag on the user (`inactive`) and blocks that account: sign-in is refused and site APIs
  return 403 `account_inactive`. Only the admin writes that flag.
- English only (§6 exception). Customer-facing text caused by admin actions (notifications, emails) stays
  en + ar.

## 10. Git & verification

- Create a focused Git commit for completed work; do not include unrelated changes.
- When an epic is complete, confirm all its milestones and acceptance criteria are done, update its `STATUS.md`, and create a commit for the completed epic.
- Run the checks before calling work done:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npx tsc -p tsconfig.generator.json --noEmit` (generator code)
  - `npm run check:messages` (once it exists)
  - `npm run build`
  - `npm test` and `npm run test:api` (once they exist, see `docs/features-v2-plan.md` Q1)
- New behaviour comes with tests for its acceptance criteria (Q1 rules: test real behaviour, no fake tests).
- Manually verify the acceptance criteria in your task file (curl for APIs, browser for UI).
