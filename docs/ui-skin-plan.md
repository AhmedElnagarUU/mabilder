# UI Skin Plan: Lunova look for the app

Reference: `docs/app-ui-reference/lunova/` (`landing.html`, `dashboard.html`, `styles.css`).

## Goal

Give the app UI (landing, dashboard, wizard) the Lunova look: dark, calm, teal accent, Geist font,
light rings and glass panels. The **content** is about our product, a website builder for
architecture, interior design, decoration, engineering and construction firms (see `docs/PRD.md`).

## Hard rules

1. **Tailwind only.** Use Tailwind utility classes, with arbitrary values for the special effects
   (`bg-[radial-gradient(...)]`, `[mask:...]`, `[transform:rotateX(47deg)_...]`, etc.).
   - Colors, fonts, radii and keyframes go in the existing `@theme` block in `src/app/globals.css`.
   - **No** CSS Modules, no new CSS files, and no copying `styles.css` into the app.
   - No new dependencies.
2. **Reuse what exists:**
   - `buttonClass` (`src/shared/ui/button.ts`), `Field`/`TextAreaField`, `Card`, `Badge`, `Icon`,
     and `Logo` from `src/shared/ui/`. Restyle them for the dark theme; don't create parallel ones.
   - Add missing icons to `src/shared/ui/icon.tsx`, copying the SVG paths from the reference.
3. **Keep the token names.** Remap the existing `@theme` color tokens (`canvas`, `surface`, `panel`,
   `ink`, `muted`, `faint`, `line`, `accent`, …) to the Lunova palette, so every existing class
   follows the new theme:
   - background `#050506`
   - ink `#f3f3f0`
   - muted `#929298`
   - dim/faint `#6a6a71`
   - line `rgba(255,255,255,.09)`
   - accent `#5eead4`, accent-strong `#0d9488`
4. **Fonts:** Geist and Geist Mono through `next/font/google` replace Inter and Sora. IBM Plex Sans
   Arabic stays for `ar`.
5. **RTL:** logical utilities only (`ms-/me-/ps-/pe-/start-/end-/text-start`). The reference CSS uses
   `left`/`right`, so convert them. Directional arrows get `rtl:rotate-180`.
6. **No user-facing strings in code.** Everything goes in `src/messages/en.json` + `ar.json`. Replace
   the old `landing` copy ("six pages", generic small businesses) with the new copy.
7. **No false claims.** No customer logos, no usage statistics, no testimonials from people. The
   reference has already been cleaned of them. Keep it that way.
8. **Motion:** keep the hero entrance, the slow float of the hero card, and the scroll reveal. All of
   it is off under `motion-reduce`. The scroll reveal and the mobile menu are small client components.

## Landing: `landing.html` is the source of truth

`docs/app-ui-reference/lunova/landing.html` is **already adapted**. Its text is final English copy and
its structure is the section order. Port it section by section into `src/features/landing/components/`
(one component per section; rename or replace the current ones):

header/nav · hero (sky + rings + beam + **site-sheet** card) · "Made for" industries · orbit statement ·
about · how it works (4 steps) · capabilities (5 cards) · stats · principle quote · CTA · footer

Elements that are new in `landing.html` have **no CSS in `styles.css`**. Design them with Tailwind in
the same visual language:

| Element | Design |
|---|---|
| `.site-sheet` | Same 3D tilt, edge glow and float as the old credit card, but showing a mini website: browser bar (dots, url, EN/ع chip), nav row, hero area with a faint blueprint grid + building outline SVG + 2-line headline, 3 project tiles. |
| `.industry` | icon + label, styled like the old brand logos (muted, white on hover). |
| `.how` / `.step-card` | 4 cards in a row (2 on tablet, 1 on mobile), styled like `.cap-card.third`, with a big light step number. |
| `.brief-map` | Two columns: brief chips → arrow → a mini page with a headline, a paragraph and one stat. |
| `.mini-project` | A tilted card like `.mini-card`, with a gradient "photo", title, meta and a "Featured" pill. |
| `.lang-switch` | A small pill link in the nav, like `.nav-get` but quieter. Use the existing `LocaleSwitcher`. |

Links:
- "Start free trial" goes to the dashboard (`/[locale]/dashboard`). The trial itself comes later (B1).
- The language links use `LocaleSwitcher`.

## Dashboard (`dashboard.html` gives the look only; its content is fintech, so ignore it)

Use the shell: sidebar + top bar + welcome + KPI row + 12-column panel grid. Show **only real data**
from `SiteSummary` (`businessName`, `industry`, `status`, `updatedAt`, `slug`, `id`). No charts,
transactions, cards, sparklines or search.

- **Sidebar:**
  - brand
  - a "business" card (initial + business name + industry of the latest site)
  - nav: Overview (active), Edit website (`/edit/{id}`), Preview site (`/preview/{id}/index.html`, new tab)
  - language switcher at the bottom
  - Collapsed to icons under 980px, as in the reference.
- **Top bar:** breadcrumb "Dashboard › Overview" + `LocaleSwitcher`.
- **Welcome:** "Welcome back, *{businessName}*." plus the actions Preview site (ghost) and Open editor (light).
- **KPIs (4):** Website status (primary card, translated status), Industry, Last updated (localized date), Preview address (`/{slug}`).
- **Panel col-8 "Your website":** a flat mini site-sheet + rows (business, industry, status, updated) + Edit / Preview / Delete (the existing `DeleteSiteButton`).
- **Panel col-4 "Next step"** (the `ai-panel` look): a status-based message.
  - `draft` / `generating`: being written
  - `ready`: open the editor, then share the preview
  - `error`: retry in the editor
- **Empty state** (no site): one wide panel saying "No website yet", with a short text and a "Create your website" button to `/dashboard/new`.
- If more than one site exists (old data, before A1), show the latest as "Your website" and list the
  others in a compact table panel styled like `.tx-table`.

## Wizard (`/dashboard/new`)

The same dashboard shell. The stepper uses `sec-label` chips (number + title, active one light). The
form sits in `.panel`-style cards. Fields are dark inputs: transparent background, `line` border, teal
focus ring, mono uppercase labels. Behavior, fields and API calls stay exactly as they are.

## Editor

Out of scope (rebuilt in M7). After the token change it must stay readable. Fix only contrast
problems the new tokens cause.

## Round 2: review findings and new design (after UI1)

### Contrast bug (whole app)
The theme turned `ink` into near-white. Old code that meant "dark button" (`bg-ink … text-white`,
`bg-white … text-white`) is now white on white:
- wizard "Next"
- the sidebar "Start a site"
- the editor's active page tab, "Open live site", and save

**Rule:** buttons always use `buttonClass(variant)`. Never hand-mix `bg-ink`/`bg-white` with
`text-white`. A light surface always gets dark text (`text-[#08080a]`).

### Editor chrome (the editor is otherwise out of scope until M7)
- The header and page tabs become dark glass: `bg-canvas/80 backdrop-blur border-b border-line`.
  The active tab is a light pill with dark text. All buttons go through `buttonClass`.
- The generation error banner shows a short friendly message ("AI is busy right now. Your draft is
  saved, try again in a minute.") with the raw provider error hidden behind a "Details" toggle.

### Landing hero: "exploded website" (replaces the site-sheet card)
- Three glass layers stacked in 3D, one website taken apart into its sections:
  1. header + a large photo + a 2-line headline
  2. a projects grid with 3 photos
  3. a contact row + an "EN · ع" language chip
- Layers are rounded 18px, with a teal edge glow and a dark glass fill, tilted with the same
  perspective (about `rotateX(55deg) rotateZ(-30deg)`), and spaced about 70px apart vertically.
- Each layer floats with the same keyframes but a different delay (0s / 1.2s / 2.4s).
- Outside the 3D scene, three small labels sit at the side, each linked to its layer by a thin teal
  line: "Written by AI", "From your projects", "English · العربية". The labels are in messages and
  mirror in RTL.
- Under 720px: only layers 1–2, no labels.
- Photos are local files in `public/landing/` (Unsplash license), loaded with `next/image`. Decorative
  images get `alt=""`.

### Landing: other changes
- **New "work like this" gallery** after the industries strip: an endless, slow horizontal row of
  8 photo cards from `public/landing/` (rounded 20px, about 340×240).
  - Each card shows a caption with a generic category only, e.g. "Residential · Villa" or
    "Interior · Living room". No client names.
  - It pauses on hover, and is a static, scrollable row under `motion-reduce`.
- **Spacing:** remove the big empty gaps after the hero and after the orbit. No section gap is larger
  than about 160px on desktop.
- **Typos:** fix the missing space in "interiors and" in the about heading.
- **"Projects first" card:** use a real photo instead of the gradient.

### Photo assignments (`public/landing/<id>.jpg`)
| Use | File |
|---|---|
| Hero layer 1 | `1600585154340-be6161a56a0c` (villa at dusk) |
| Hero layer 2 grid | `1600607687939-ce8a6c25118c`, `1512917774080-9991f1c4c750`, `1487958449943-2429e8be8625` |
| Projects-first card | `1600210492486-724fe5c67fb0` |
| Gallery (all 10, any order) | every file in `public/landing/` |

## Milestones

| # | Task | Acceptance |
|---|---|---|
| UI1 | Theme tokens + fonts in `globals.css`/layout, shared UI restyle, full landing page | Landing matches the reference look in `/en` and `/ar` (RTL), mobile works, no hardcoded strings, gates pass |
| UI2 | Dashboard + wizard in the new shell, contrast-bug sweep, editor chrome | Dashboard shows only real site data in both languages; no white-on-white anywhere; editor header readable; wizard works as before; gates pass |
| UI3 | Landing round 2: exploded-website hero, photo gallery, spacing, real photos | Matches "Round 2" above in `/en` and `/ar` at desktop and mobile; gates pass |
