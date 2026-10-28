# Features v2 Plan

Product context: `docs/PRD.md`. Rules: `CODE_RULES.md`. Builds on `docs/block-system-plan.md` and
`docs/auth-billing-plan.md`; where this file disagrees with them, **this file wins** (owner decision,
2026-10-28).

## Owner decisions (2026-10-28)

| Topic | Decision |
|---|---|
| Accounts | better-auth, email + password only. One website per account (already planned in A1). |
| Dashboard name | The dashboard greets and labels by the **user's name**, not the website name. |
| Projects | Managed in the dashboard (add, edit, delete, reorder, photos). They are portfolio entries, not websites. |
| Uploads | S3 presigned PUT from the browser (CODE_RULES §7). Used for project photos and editor image replace. |
| Editor | The live website fills the screen. One floating side panel (left or right, collapsible). No top bar. |
| Removing a section | "Remove" hides the section. Removed sections can be restored from the panel. Nothing is lost. |
| SEO | Page titles and descriptions move out of the editor to a dashboard **SEO** page. |
| AI | Limited by **daily credits**: 20 per rolling 24 hours. Rewriting one section costs 1. The first generation of a site is free. Failed AI calls are not charged. |
| AI rewrite | The customer picks what to rewrite (one section, several sections, or a page) and can add a short instruction ("shorter", "more formal"). |
| Tracking | Customer pastes IDs for Meta Pixel, Google Analytics 4, TikTok Pixel, Snapchat Pixel, Microsoft Clarity. Injected into the generated site. |
| Tutorials | Small popovers next to buttons and menus, step by step, with Skip. Replay from a help button. |
| Implementer | Each milestone is delegated to a separate Claude Code session; the orchestrator reviews and commits. |

## Order

Foundation first. The new editor needs sections (blocks) in the real pipeline.

1. **A1** auth + one site per account + dashboard user name (`docs/auth-billing-plan.md`, plus D1 below)
2. **M2 → M3 → M4 → M5 → M6** block pipeline (`docs/block-system-plan.md`). M5 must expose a
   per-block rewrite function (used by C1).
3. **U1** S3 uploads
4. **P1** projects manager
5. **E1** new editor (replaces M7)
6. **S1** SEO page
7. **C1** AI credits + scoped rewrite
8. **T1** tracking
9. **G1** tutorials
10. **B1** Polar, any time after A1

## D1 Dashboard user name (part of A1)

- Sidebar and greeting show `session.user.name`. The website name appears only on the website card.

## U1 S3 uploads

```text
src/features/uploads/
  s3.ts                    S3 client (env below), createUploadUrl(key, contentType)
  service.ts               requestUpload(ownerId, siteId, slotId, contentType, size) → { uploadUrl, publicUrl }
  types.ts                 zod: contentType in image/jpeg|png|webp, size ≤ 8 MB
  components/image-upload-button.tsx   pick file → POST → PUT to uploadUrl → onUploaded(publicUrl)
src/app/api/uploads/route.ts           POST (session + site owner) → { uploadUrl, publicUrl }
```

- Key: `sites/{siteId}/{slotId}/{uuid}.{ext}`. URL expires in 5 minutes.
- Packages: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` (already approved).
- Env: `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`.
- The bucket needs CORS allowing `PUT` from `NEXT_PUBLIC_APP_URL`.

Acceptance: an image uploads from the browser and opens at `publicUrl`; a wrong type or > 8 MB returns
400; another user's `siteId` returns 404.

## P1 Projects manager

```text
src/features/projects/
  model.ts  repository.ts  service.ts  types.ts
  components/project-list.tsx  project-form.tsx
src/app/[locale]/dashboard/projects/page.tsx
src/app/api/projects/route.ts               GET list, POST create
src/app/api/projects/[projectId]/route.ts   PUT update, DELETE
src/app/api/projects/order/route.ts         PUT { ids: string[] }
```

- Project: `{ ownerId, siteId, title, category?, location?, year?, description?, photos: { url, alt }[] (≤ 10), showOnHome: boolean, order }`.
  Text is per site locale (`localized`); for a two-language site the second language is optional and
  falls back to the first.
- Photos upload through U1 (`slotId = "projects"`).
- Projects are **facts**: `buildFacts` reads them from this collection. After every change the site is
  re-rendered (no AI). The projects page shows all projects; the home page projects block shows only
  `showOnHome` projects (max 6) in `order`. With no `showOnHome` projects, the home block is skipped.

Acceptance: add/edit/delete/reorder persists; photos show on the site after save; toggling
"Show on home page" changes the home page; user A can't read or change user B's projects (404).

## E1 New editor (replaces M7)

Move the editor to `src/features/site-editor/` and delete the old `content-editor.tsx` /
`content-fields.tsx`.

- **Layout:** the website preview fills the screen. One floating panel (about 320 px), docked left or
  right (toggle; remembered in `localStorage`), collapsible to a small button. No top bar. The panel
  header has: back to dashboard, page switcher, Save (with "unsaved changes" dot), panel side toggle.
- **Panel, "Sections" view (default):** the current page's sections as a list with business names
  ("Intro", "Our projects", "Contact"…). Drag or up/down to reorder; "Remove" hides a section. A
  "Removed sections" group at the bottom restores them.
- **Panel, "Edit section" view:** clicking a section on the site selects it (outline + name label) and
  opens its fields in the panel: text fields, image slots, and "Rewrite with AI" for this section (C1).
  Back arrow returns to the list.
- **On the site:** text is edited inline by clicking it. Clicking an image opens a small popover:
  "Upload from device" (U1) or "Another stock photo" (Pexels).
- Fact sections (projects, clients, awards…) link to their dashboard page instead of editing facts.
- Save uses the existing `PUT /api/sites/[siteId]/content`. All strings in `editor` namespace, en + ar.

Acceptance: reorder/remove/restore persists and survives regenerate; inline text and image replace
save; panel works on both sides and in RTL; no metadata fields remain in the editor.

## S1 SEO page

```text
src/features/seo/components/seo-form.tsx
src/app/[locale]/dashboard/seo/page.tsx
src/app/api/sites/[siteId]/seo/route.ts     PUT { pages: { id, meta: localized({ title, description }) }[] }
```

- One card per page: title (counter, aim ≤ 60) and description (counter, aim ≤ 160) per site language,
  with a Google-style result preview. Save re-renders the site (no AI).

Acceptance: edited titles/descriptions appear in the generated `<title>` and `<meta name="description">`.

## C1 AI credits + scoped rewrite

```text
src/features/credits/
  model.ts                 CreditUse { ownerId, cost, reason, createdAt }
  plans.ts                 DAILY_CREDITS = 20, WINDOW_HOURS = 24
  service.ts               getBalance(ownerId) → { limit, used, left, nextResetAt }; spend(ownerId, cost, reason)
  components/credit-badge.tsx
src/app/api/credits/route.ts                  GET → balance
src/app/api/sites/[siteId]/rewrite/route.ts   POST { pageId, blockIds: string[], instruction?: string (≤ 200) }
```

- Cost = number of `copy` blocks rewritten. Fact blocks are never rewritten.
- Before the AI call: if `left < cost`, return `429 { code: "credits_exhausted", nextResetAt }`.
  Charge only after the rewrite succeeded and validated.
- The rewrite prompt includes the current text and the instruction, so a repeat gives a real change.
- Editor: "Rewrite with AI" shows the cost and credits left before confirming. A page-level
  "Rewrite this page" lets the customer tick which sections.
- Update PRD §11, CODE_RULES §7 and `docs/auth-billing-plan.md` ("AI not counted" → daily credits).

Acceptance: 21st credit in 24 h returns 429; failed AI call costs nothing; only the chosen blocks
change; credits refill after 24 h.

## T1 Tracking

```text
src/features/tracking/
  types.ts                 zod: metaPixelId /^\d{15,16}$/, ga4Id /^G-[A-Z0-9]{6,12}$/,
                           tiktokPixelId /^[A-Z0-9]{20}$/, snapPixelId (uuid), clarityId /^[a-z0-9]{8,12}$/
  render-tags.ts           tracking settings → head snippets (IDs escaped; only validated IDs)
  components/tracking-form.tsx
src/app/[locale]/dashboard/tracking/page.tsx
src/app/api/sites/[siteId]/tracking/route.ts  PUT
```

- Stored on the site (`tracking`). Every empty field adds nothing. Snippets are the official base
  codes (PageView only). Save re-renders the site.
- Each field has a short "Where do I find this?" help text.

Acceptance: invalid IDs return 400; valid IDs appear in every generated page `<head>`; empty settings add
no scripts.

## G1 Tutorials

```text
src/features/onboarding/
  tours.ts                 tour id → steps { target (data-tour value), titleKey, bodyKey }
  components/tour.tsx      popover next to [data-tour] target, Next / Back / Skip, arrow, RTL aware
  components/help-button.tsx  replays the page's tour
```

- Tours: dashboard, projects, editor, SEO, tracking. Shown once per tour (`localStorage`), replay from
  the help button. No new package.

Acceptance: first visit shows the tour; Skip/finish never shows it again; help replays it; works in RTL
and on mobile.

## Rules for every milestone

- Read `CODE_RULES.md` in full first. No Server Actions; route handlers only, at the paths above.
- Every owner-scoped API: `requireSession` + owner check (401 / 404).
- All user-facing text in `src/messages/en.json` and `ar.json`.
- Run every check in CODE_RULES §9 and verify acceptance in the browser/curl.
