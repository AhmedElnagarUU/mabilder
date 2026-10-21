# CODE_RULES.md

**Every agent or sub-agent must read this file in full before writing or modifying any code.**

---

## 1. KISS — Keep It Simple

- Code must be simple enough to read and review with zero ambiguity about what is right or wrong.
- No clever abstractions, no premature generalization, no "frameworks inside the framework".
- Optimize for readability over cleverness. If two implementations exist, pick the boring one.
- Do not add comments explaining obvious code; write code so obvious it needs no comments.

## 2. Feature-based structure — never organize by file type

The codebase is organized by **feature/module**, not by technical type.

```


- Each feature owns its components, hooks, API logic, schemas, and types under `src/features/<feature>/`.
- A route file in `src/app/api/**` must contain no business logic: parse request → call feature function → return response.
- Anything used by **two or more features** goes in `src/shared/` so common project code has one centralized home. Anything used by one feature stays in that feature.
- Keep shared code focused on reusable cross-feature concerns; for example, MongoDB connection setup belongs in `src/shared/db/`, while feature-specific data access stays with its owning feature.
- Any feature can be understood, modified, or removed without breaking unrelated features.

## 3. One responsibility per function

- Each function does exactly one thing.
- Related functions stay grouped together in the same module — do not scatter them.
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

Dev tooling: `typescript`, `eslint`, `@types/*`. Nothing else without approval.

## 5. File/function length — guideline, not hard limit

No numeric limit is enforced. The test: if a file stops being easy to scan top-to-bottom, split it along feature/responsibility lines.

## 6. i18n & RTL by default

- **No hardcoded user-facing strings. Ever.** All text renders through the translation layer (`next-intl`). Every task tells you which string keys you introduce — add them to BOTH `src/messages/en.json` and `src/messages/ar.json`.
- Arabic translations are provided in each task. Use them verbatim; do not invent your own.
- The product UI supports `en` and `ar` locales from day one. Routes are prefixed: `/en/...`, `/ar/...`. The `<html>` element gets `lang` and `dir="rtl"` for Arabic.
- Layout must not break in RTL: always use CSS logical properties (Tailwind: `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`, `start-0`, `end-0`). NEVER use directional properties (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `text-left`, `text-right`, `left-0`, `right-0`) in layout-critical styles. Icons with direction (arrows) must flip via `rtl:rotate-180`.
- Business-language rule: user-facing labels never use web-design terminology ("component", "grid", "section container", "breakpoint").

## 7. Stack conventions (binding)

- **Next.js App Router + TypeScript.** Server Components by default; `"use client"` only where interactivity requires it.
- **No Server Actions.** Do not use Next.js Server Actions under any circumstance. All API endpoints and mutations must be implemented as route handlers (`route.ts`) under `src/app/api/**` exclusively. Every endpoint path is defined in the task file — do not invent different paths.
- **mongoose** through the shared connection singleton in `src/shared/db/`. Each feature that persists data must define a `model.ts` beside its `repository.ts`, with a Mongoose schema and model for every collection it writes. Repositories must write through that model so MongoDB-bound data is validated at runtime; TypeScript interfaces remain the source of static typing. Validate external input with `zod` at API boundaries.
- **Auth** via better-auth (email/password), session cookie based. Every owner-scoped API must verify the session and that `site.ownerId === session.user.id`; otherwise return `401` (no session) or `404` (not owner).
- **S3**: presigned PUT uploads from the browser; objects are served from the bucket's public base URL (`S3_PUBLIC_BASE_URL`). Key pattern: `sites/{siteId}/{slotId}/{uuid}.{ext}`.
- **Env vars** are documented in `.env.example`; never commit real secrets.



- Create a focused Git commit for completed work; do not include unrelated changes.
- When an epic is complete, confirm all its milestones and acceptance criteria are done, update its `STATUS.md`, and create a commit for the completed epic.
- Manually verify the acceptance criteria in your task file (curl for APIs, browser for UI, both locales).
