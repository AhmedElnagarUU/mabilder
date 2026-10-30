# Block Library Plan: swappable section designs from owner templates

Owner request (2026-10-30). Rules: `CODE_RULES.md`. Builds on `docs/block-system-plan.md`; where they
disagree, **this file wins**.

## Goal

Websites are built from a **library of ready sections**. Every section belongs to a **category** (hero,
services, projects, contact…). All designs of one category read **the same content** in the same way, so the
customer can swap a section's design for another design of the same category and the text, photos and facts
stay exactly where they belong. New designs come from HTML/CSS templates the owner drops into `templates/`.

## What already exists (keep it)

| Today | Becomes |
|---|---|
| Block **type** with one zod schema (`static-site-generator/blocks/*.ts`) | **Category** with one content schema. Unchanged. |
| AI writes copy per block type into `props` (`generation/*`) | Unchanged: content is stored per category, never per design. |
| Theme `agenvo` renders each type with **variants** (`themes/agenvo/blocks/*.ts`) | The first **design pack**. Each variant becomes one **design** (`agenvo/hero-full-image`). |
| `block.variant` on each section | `block.design` (pack + design id). Old `variant` values are read as `agenvo/<type>-<variant>`. |

## Decisions

| Topic | Decision |
|---|---|
| Content contract | One schema per category (the existing catalog). A design may show fewer fields (it must not break when optional fields are empty) but never adds or renames fields. A new category or a new field needs owner approval. |
| Design pack | `src/features/static-site-generator/designs/<pack>/`: `pack.ts` (id, name, preview), `tokens.css` mapping (see Styling), one render file per design `<category>/<design>.ts`, and the pack's CSS/JS assets. |
| Design id | `<pack>/<design>`, e.g. `agenvo/hero-full-image`, `noor/hero-split`. Stored on the block as `design`. |
| Swap | Editor → Structure mode → section → **Change design** → gallery of every design of that category, previewed with the site's real content → Apply. Only `design` changes; `props`, id, order and hidden stay. No AI call. |
| Mixing packs | Allowed: a site can use a hero from one pack and services from another. Coherence comes from **site tokens** (below). |
| Styling | Every design styles itself only through CSS variables (`--site-bg`, `--site-ink`, `--site-accent`, `--site-font-display`, `--site-font-body`, `--site-radius`, `--site-space`). The site has one token set (its "style"); packs ship default token values. Pack CSS is scoped to its sections (`[data-design^="<pack>/"]`). |
| Conversion | **Developer-time, not runtime.** An agent converts a template into a design pack following the contract below; `npm run check:theme` (extended to all designs) proves it. No LLM at runtime, no HTML parsing at runtime. |
| RTL + languages | Every design renders correctly in `ar` (RTL, logical CSS) and `en`, like today. |
| Images | Each design declares the aspect ratio it uses per image slot (e.g. hero 16:9, project card 4:3). Images are always rendered with `object-fit: cover` inside that ratio, so any photo size looks consistent. |

## Design contract (what a converted design must satisfy)

1. `render(props, context) → string`, root element `<section data-block="{id}" data-design="{pack}/{design}" …>`.
2. Reads only its category's schema; every optional field can be empty without leaving holes.
3. All dynamic output through `content/html.ts` (`renderText`, `escapeAttribute`); no hardcoded copy.
4. Only token CSS variables for colors, fonts, radius; logical CSS properties only.
5. Declares image slots with aspect ratios; no inline image sizes.
6. Has a preview: renders the category's `full` and `minimal` fixtures in `en` and `ar` without errors,
   `undefined` or `[object Object]` (checked by `check:theme`).
7. No external scripts except the pack's own assets; interactive bits degrade gracefully without JS.

## Template intake (`templates/`, repo root)

- The owner adds `templates/<pack-name>/` with `index.html` (and other pages), CSS, fonts/images, plus an
  optional `notes.md` (which part is the hero, etc.).
- `templates/` is source material only: ignored by lint and TypeScript, never served, never imported by app code.
- Conversion task per pack: split the template into sections → map each to a category (or flag "no matching
  category" for owner approval) → write one design per section following the contract → map template colors /
  fonts to tokens → run checks → screenshots of each design with the fixtures for review.

## Milestones

| # | Task | Implementer | Acceptance |
|---|---|---|---|
| L1 | Design registry: `block.design`, read old `variant`, agenvo variants become `agenvo/*` designs, `data-design` attribute, tokens CSS variables in agenvo, `check:theme` covers every design | Sonnet | Existing sites render identically; every design × fixture × locale passes; old content with `variant` still loads |
| L2 | Editor "Change design": per-section gallery (live previews with the site's content), apply, undo | Sonnet | Swapping keeps all content; saved and re-rendered; works in RTL |
| L3 | Site style: token presets (palette + font pair) chosen in the editor; all designs follow it | Sonnet | Changing style restyles every section, no content change |
| L4 | Convert the first owner template in `templates/` into a design pack | Opus plans the mapping, Sonnet converts | Every section of the template is a design (or listed for approval); checks pass; screenshots reviewed |
| L5+ | One milestone per additional template pack | Sonnet | Same as L4 |

Order: L1 → L2 → L3 → L4 (L4 can start when the first template arrives; L1 is required first).

## Open questions (owner)

- Should the AI ever pick designs automatically at first generation (e.g. per industry), or always start from a
  default pack and let the customer change?
- Is mixing packs on one site allowed for customers, or one pack per site (simpler visual consistency)?
