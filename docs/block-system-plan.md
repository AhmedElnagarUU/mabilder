# Block System Plan

Product context: `docs/PRD.md`. Rules: `CODE_RULES.md` §8.

## Goal

Replace the fixed 6-page Agenvo template with a block system:

- A site is an ordered list of **blocks** per page.
- **Rules** (no AI) decide which pages and blocks appear, based on the customer's real data.
- Thin data still gives a correct site, with no empty or fake sections.
- Customers can **reorder** and **hide** blocks.
- Content is theme-independent; **themes** only decide how blocks look.

## Decisions

| Topic | Decision |
|---|---|
| Ordering | Rules (page recipes + `needs`). No AI planner. |
| Images | Customer photos first; otherwise Pexels (`PEXELS_API_KEY`, built-in `fetch`). Chosen once, saved in props. |
| Editor | Inline text edit, image replace, reorder (up/down), hide/show. |
| Themes | Several. v1 ships Agenvo only. |
| Old data | Deleted (done). No migration. |
| Where block code lives | Inside `static-site-generator` (not `src/shared`). Other features import its catalog types. |
| Theme import pipeline | Later, after v1. Decide then where it runs. |
| Sample content | The big `content/agenvo.json` and `content/base-content.ts` are split into per-block `fixtures`. Both files are deleted at M4. |

### Why other features need the block catalog

The block **catalog** is the description of what data each block holds. Three places need it:

1. **The renderer** (`static-site-generator`) turns block data into HTML.
2. **The site builder** (`site-creation`) runs the rules to pick blocks, and asks the AI to fill exactly
   the fields each block has. It must know the block's schema to validate what the AI returns.
3. **The editor** shows the block list, reorders and hides blocks, and edits their fields.

Only the renderer and themes contain HTML. The others only import types, schemas and the catalog list.

## Target structure

```text
src/features/static-site-generator/     renders sites; owns the block catalog and themes
  content/html.ts                        escape helpers (keep)
  blocks/
    common.ts                            shared zod pieces: image, link, card, stat, faq, project, person
    facts.ts                             Facts schema + type (the real customer data blocks may use)
    types.ts                             BlockDefinition type
    <type>.ts                            one file per block type (see catalog)
    catalog.ts                           list of all definitions + lookup + block union schema
  site-content.ts                        SiteContent schema + types
  themes/
    types.ts                             Theme type
    registry.ts                          id → theme
    agenvo/
      theme.ts  document.ts  nav.ts  footer.ts
      blocks/<type>.ts                   render functions
      assets/site.css  assets/site.js
  render-site.ts                         SiteContent → { fileName, html }[]
  generate-site.ts                       writes files + assets to generated-sites/<siteId>/
  read-generated-file.ts  site-paths.ts  (keep)

src/features/site-creation/             brief → finished SiteContent; storage; wizard
  facts.ts                               buildFacts(brief) → Facts (code only)
  composition/recipes.ts                 page recipes
  composition/compose.ts                 facts + theme → pages with block skeletons
  generation/                            profile (keep), copy.ts (AI per page), prompts, rate-limit
  images/pexels.ts                       search + pick images
  model.ts repository.ts service.ts types.ts components/ wizard-steps.ts

src/features/site-editor/               editor UI (moved out of static-site-generator at M7)

scripts/seed-site.ts                     demo site from a sample brief + fixtures (no AI)
scripts/check-theme.ts                   renders every block of a theme with every fixture
```

## Data model

### Facts (`blocks/facts.ts`)

Built by code from the brief. The **only** source of facts on the site.

```ts
Facts {
  businessName: string
  industry: string
  email?: string
  phone?: string
  website?: string
  address?: string               // brief.location
  yearsInBusiness?: number       // parsed integer > 0
  projectCount?: number          // parsed integer > 0
  services: string[]             // customer-listed service names (may be empty)
  clients: string[]
  awards: { year: string; title: string }[]
  projects: { title: string; category?: string; location?: string; year?: string;
              description?: string; images: Image[] }[]       // [] until wizard fields exist
  team: { name: string; role: string; bio?: string; image?: Image }[]   // [] until fields exist
  testimonials: { quote: string; author: string; company?: string }[]  // [] until fields exist
}
```

### Block definition (`blocks/types.ts`)

```ts
BlockDefinition<Props> {
  type: string
  kind: "copy" | "fact"
  variants: readonly string[]          // first one is the default
  schema: z.ZodType<Props>
  needs: (facts: Facts) => boolean     // copy blocks: () => true
  fixtures: { full: Props; minimal: Props }
}
```

- `full`: every optional field and realistic list lengths. Text comes from `content/agenvo.json`.
- `minimal`: only required fields, shortest valid lists.

### Site content (`site-content.ts`)

```ts
Block   { id: string; type: BlockType; variant: string; hidden: boolean; props: <schema of type> }
Page    { id: string; slug: "index" | "about" | "services" | "projects" | "contact";
          title: string; meta: { title: string; description: string }; blocks: Block[] }
SiteContent {
  theme: string                       // "agenvo"
  locale: "en" | "ar"                 // one language per site, see docs/i18n-plan.md §2
  facts: Facts
  nav: { items: Link[]; cta: Link; menuLabel: string }
  footer: { blurb: string; copyright: string; photoCreditLabel: string }
  pages: Page[]                       // at least one page; first page slug is "index"
}
```

- `Block` is a zod **discriminated union on `type`**. Each member's `props` is that block's schema and
  `variant` must be one of its variants.
- Internal links use `<slug>.html`. `isSafeHref` must accept the new slugs.

## v1 block catalog

Common pieces (`blocks/common.ts`): `image {src, alt, credit?: {name, url}}`, `link {label, href}`,
`card {title, body, icon?}`, `stat {value, label}`, `faqItem {question, answer}`.

Every block has an optional `eyebrow` and a `title` unless noted.

| type | kind | variants | props (besides eyebrow/title) | needs | Agenvo source |
|---|---|---|---|---|---|
| `hero` | copy | `full-image`, `page`, `text-only` | `body`, `image?`, `primary?: link` | — | every page hero |
| `marquee` | copy | `default` | `items: string[]` (3–8), no title | — | `*.marquee` |
| `intro` | copy | `images`, `quote` | `paragraphs: string[]`, `quote?`, `images: image[]` (0–3), `link?` | — | home.studio, about.intro |
| `feature-split` | copy | `image-right`, `image-left` | `paragraphs: string[]`, `points: string[]`, `image?`, `link?` | — | services.architecture / engineering |
| `services` | copy | `columns`, `list` | `body?`, `items: card[]` (2–6) | — | home.services, services.advisory |
| `values` | copy | `default` | `body?`, `items: card[]` (2–6) | — | about.beliefs, profile.culture |
| `process` | copy | `default` | `body?`, `steps: card[]` (3–6), number shown by index | — | home.process, services.process |
| `faq` | copy | `default` | `body?`, `items: faqItem[]` (3–8) | — | services.faq, contact.faq |
| `cta` | copy | `dark`, `light` | `body`, `primary: link`, `secondary?: link` | — | `*.cta` |
| `contact` | copy | `split`, `form-only` | `body`, `form: {namePlaceholder, emailPlaceholder, messagePlaceholder, submitLabel, successMessage}` | — | home.contact, contact.enquiry |
| `stats` | fact | `dark`, `light` | `items: stat[]` (2–4) | ≥2 of years / projectCount / clients.length≥3 / awards.length≥1 | home.stats, work.numbers |
| `clients` | fact | `default` | `body?`, `names: string[]` | clients ≥3 | work.clients |
| `awards` | fact | `default` | `body?`, `items: {year, title}[]` | awards ≥1 | about.awards |
| `timeline` | fact | `default` | `body?`, `items: {year, title, body}[]` | yearsInBusiness ≥2 | about.timeline |
| `projects` | fact | `featured`, `grid` | `body?`, `items: {title, meta, category?, body?, image}[]`, `link?` | projects ≥1 | home.projects, work.grid, work.featured |
| `team` | fact | `default` | `body?`, `items: {name, role, bio, image?}[]` | team ≥1 | about.leadership, profile.partners |
| `testimonials` | fact | `default` | `items: {quote, author, company?}[]` | testimonials ≥1 | case study quote |
| `location` | fact | `default` | `body?`, `address`, `email?`, `phone?`, `mapHref` | address | contact.offices |

Fact props are copied from `facts` by code. The AI may only write their `eyebrow`, `title` and `body`.

Dropped from Agenvo: services index, interiors cards, fees, case studies, studio life, careers, press,
departments, newsletter. They can return later as catalog additions.

## Composition rules (`site-creation/composition`)

Page recipes, in order. Fact blocks are skipped when `needs` is false. A page that ends up with fewer
than 2 blocks after its hero is dropped, except Home.

| Page | Recipe |
|---|---|
| index (Home) | hero `full-image` · marquee · stats · intro · projects `featured` · services `columns` · process · testimonials · clients · cta · contact `split` (contact only when the Contact page is dropped) |
| about | hero `page` · intro `quote` · values · timeline · team · awards · cta |
| services | hero `page` · services `list` · feature-split (one per customer service, max 3, alternating left/right) · process · faq · cta |
| projects | hero `page` · projects `grid` · stats · clients · cta |
| contact | hero `page` · contact `form-only` · location · faq |

- **Thin brief** (no optional facts): Home + Services + Contact. **Rich brief**: all 5 pages.
- No image available → hero `text-only`. `intro` uses `quote` when it has no images.
- Nav = the kept pages in recipe order. The nav CTA links to `contact.html` if it exists, else `#contact`.
- Block ids: `<pageSlug>-<type>-<n>`, stable for the same input.

## Rendering and themes

```ts
Theme {
  id: string; name: string
  assets: string[]                                      // files copied from themes/<id>/assets
  tones: readonly ("light" | "dark")[]                  // background rhythm by visible-block position
  renderDocument(page, body, content): string
  renderNav(content, page): string
  renderFooter(content, page): string
  blocks: Partial<Record<BlockType, (block, context: { tone, page, content }) => string>>
}
```

- A theme must implement: `hero`, `intro`, `services`, `cta`, `contact`. A block type the theme lacks
  is skipped by composition.
- Hidden blocks are not rendered. Tone is assigned to **visible** blocks in order.
- `renderDocument` sets `<html lang="{locale}" dir="rtl|ltr">`. Themes use logical CSS
  (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`, `text-start`) so Arabic sites render right-to-left, and
  load an Arabic-capable font for `ar`.
- `render-site.ts` returns one HTML file per page. `generate-site.ts` writes them and copies assets.
- The Agenvo port reuses the current markup and classes from `templates/*.ts` (same look), changing
  only where data comes from and making the background come from `tone`.

## Generation pipeline

```
brief → buildFacts → profile (AI) → compose → copy per page (AI) → images (Pexels) → zod parse → save → render
```

- **Language:** the AI writes every copy field in `content.locale`. Facts keep the customer's spelling.
- **Copy:** one AI call per page. The input is the brief, profile, facts, and for each block its type,
  variant, and the JSON shape of its AI-writable fields. The output is `{ blocks: [{ id, props }] }`. Each
  block is validated with its schema. Failed blocks are retried once in a single follow-up call. Fact
  fields are always overwritten from `facts` after the AI step.
- **Images:** for each empty image slot, search Pexels with `industry + block purpose + keyword`. Use
  unique photos per site, set `credit`, and show credits in the footer. Customer images are never replaced.
- **Regenerate:** keep each block's `id`, `variant`, `hidden`, order and images. Only copy fields are replaced.
- **Create site:** saves the brief and `content: null`. Generate builds the full content. On failure the
  status is `error` and the user can retry.

## Editor (M7)

- Move the editor to `src/features/site-editor/`.
- Add a block list per page: move up/down, hide/show. Save with the existing `PUT /api/sites/[siteId]/content`.
- Inline editing finds blocks through `data-block` and edits `props` fields of that block.

## Milestones (each = one delegated task)

| # | Task | Acceptance |
|---|---|---|
| M1 | Catalog: `common.ts`, `facts.ts`, `types.ts`, 18 block files with fixtures, `catalog.ts`, `site-content.ts` | Every fixture passes its schema; generator tsc, tsc, lint pass; nothing existing changed |
| I1 | App UI i18n (see `docs/i18n-plan.md`) | `/en` + `/ar` work, Arabic is RTL, no hardcoded strings in landing/dashboard/wizard |
| M2 | Agenvo theme + `render-site.ts` + `scripts/check-theme.ts` | Check renders every implemented block × `full`/`minimal` × both tones × `en`/`ar` with no error, no `undefined`/`[object Object]` in output; `ar` output has `dir="rtl"` |
| M3 | `buildFacts` + composition | Script prints composed pages for a thin and a rich brief; matches the recipes table |
| M4 | Switch the pipeline: service, repository, `generate-site`, seed (fixtures, no AI); delete old `templates/`, `content/types.ts`, both `base-content.ts`, `content/agenvo.json`, `generation/paths.ts` | `npm run seed:site` builds a previewable site; build passes. The editor is temporarily broken until M7. |
| M5 | AI copy per block | Thin and rich briefs generate valid sites; facts unchanged |
| M6 | Pexels images + credits | Image slots filled, stable on re-render |
| M7 | Editor: move feature, block list reorder/hide, inline edit on blocks, editor strings in `en`/`ar` | Reorder/hide persists and survives regenerate; editor works in both locales |
| M8 | Wizard: projects fields + website language field | Projects page appears when projects are entered; an `ar` site is written in Arabic and renders RTL |
| later | team/testimonials fields, logo upload (S3), theme import pipeline, theme picker | — |
