# Templates Plan: ready site templates the customer picks after the AI writes the content

Owner request (2026-11-01). Rules: `CODE_RULES.md` (binding, incl. §8 blocks and §11 flows). Builds on
`docs/block-library-plan.md` (L1 registry, L2 Change design). Where they disagree, **this file wins**.
Flow diagram and plain-language explanation: `docs/flows/templates.md`.

## Goal

1. The customer writes the brief and the AI writes the **content** (text, services, projects, SEO) and the
   system finds **photos from Pexels**. The content belongs to no template.
2. The customer then **picks a template** from a gallery. Each template has its own feeling (dark luxury, light
   editorial, warm interior…). The site is rendered with their content in that template. No AI call, no credits.
3. If they dislike it, they pick another template at any time. The content and photos stay the same; only the
   look changes. One section can still be changed alone with L2 "Change design".
4. The gallery shows every template with **fixed demo content and fixed demo photos**, and each one opens a
   full preview **in a new tab**.

## Analysis of the material in `templates/`

| Source | Feeling | What we take | Becomes |
|---|---|---|---|
| `aurelia/index.html` | Dark luxury: charcoal `#12100e`, gold `#c9a962`, Cormorant Garamond + Inter, diamond line pattern, thin gold dividers | Centered hero with pattern over photo, 3-column services with line icons and dividers, tall 4:5 project cards, gold number band, big italic quote | Template **Aurelia** |
| `arhitect/index.html` | Black tech: black, sand `#C4B5A0`, Inter uppercase with wide letter spacing, parallax hero | Hero with title start + tagline end, principles in divided columns, **expanding image panels** for services, project grid with place/year, counting stats, white "about" band, split contact | Template **Arhitect** |
| `Modern Construction…` (Linea) + `Northline Atelier` | Light editorial: off-white, serif headings with one *italic accent* word, terracotta / olive accent, thin lines | Split hero (text + big photo, diagonal cut), "what we do" row with vertical label, projects row with location, philosophy band, numbered 5-step process, dark quote band, footer columns | Template **Atelier** |
| `download (4)` (Moderno) + `download (5)` (Enola) | Warm soft interior: beige, cream, rounded cards, arched/rounded photo strip, huge serif name | Big-name hero, category cards with icons, rounded photo strip (gallery), soft promo band, simple contact strip | Template **Dar** (warm interior) |
| `web design real estate…` (Buildora) + `Создание сайтов…` (wood houses) | Dark construction with gold, wave dividers, big "15+ years" number | Wave section edges, big-number experience band with 4 icon stats, circle-icon services row, project cards with specs | Variants added to **Aurelia** and **Arhitect** (stats "big number", services "circle icons", projects "specs") |
| `image.png` (light interior) | Light grey, two-tone headings (black + gold words), project carousel with tags, rating "4.80" with review | Two-tone heading style, project carousel cards with tags, testimonials with rating summary + photo | Variants in **Atelier** (projects "carousel", testimonials "rating") |

Notes:
- The screenshots are other studios' published designs. We use them **only as inspiration** (layout ideas,
  mood, spacing). We never copy their logos, names, text or exact artwork.
- The two HTML files use the Tailwind CDN, Lucide from unpkg and Lenis. Generated sites must not load external
  scripts (design contract rule 7): the conversion writes **plain CSS** with the site tokens, inline SVG icons,
  and small vanilla JS in the pack's own asset (reveal, counters, panels). Everything works without JS.
- The current agenvo designs are plain (one look per section, few real alternatives). Agenvo stays as the
  **Classic** template and the **base**: when a template has no design for a section type, the agenvo design is
  used and it still follows that template's colors and fonts (tokens), so every content fits every template.

## Core idea: content and template are separate

```text
Content (AI + Pexels, saved per site)          Template (code, fixed)
  pages → blocks { type, props[locale] }         tokens: colors, fonts, radius, spacing
  facts (services, projects, reviews…)           shell: nav, footer, document, assets
  images chosen per block category               design per section type (+ extra variants)
                         \                     /
                          render-site (no AI) → static HTML
```

| Topic | Decision |
|---|---|
| What a template is | `src/features/static-site-generator/site-templates/<id>/template.ts`: `id`, `name`, `mood` (en/ar), `tokens` (the 7 `--site-*` variables + font links), `shell` (theme id for nav/footer/document), `designs` (one default design id per section type), `preview` (cover image + demo content). The design files live in the pack `designs/<pack>/`. |
| Stored on the site | `content.theme` already exists; it becomes the **template id** (old value `agenvo` = Classic, so old sites keep working). Each block keeps its own `design`, so L2 changes still work after a template pick. |
| Apply a template | One pure function `applyTemplate(content, templateId)`: sets `theme`, sets each block's `design` to the template's design for that type (base design if the template has none). **Props, ids, order, hidden, facts and images never change.** Applying A → B → A gives back the same content. |
| Content fits every template | The content schema stays one schema per section type (catalog). A template must render every section type (own design or base), with every optional field empty or full, in `en` and `ar`. `check:theme` runs every template × every fixture × both locales. |
| Images | Images are chosen for the **content**, not for one design: each section type lists its image needs once (e.g. hero 1 wide, projects 1 per item, services 1 per item optional). Pexels fills them at generation, so switching templates never needs a new search. Designs crop with `object-fit: cover` to their own ratio. |
| Schema change (owner approval needed) | `services.items[].image` (optional) so panel and card designs (Arhitect panels, Dar category cards) can show photos. Pexels fills it at generation from each service title. Nothing else changes in the content shape. |
| Gallery demo | Fixed demo content per locale (one architecture firm, `en` + `ar`) and **fixed photo URLs** chosen once from Pexels by a developer script (`npm run templates:demo-photos`) and saved in the demo fixture with the photographer credit. The gallery never calls Pexels or the AI. |
| Gallery pages | `/[locale]/templates` (public, also linked from the landing page and the dashboard): cards with cover, name, mood. **Preview** opens `/[locale]/templates/[id]/preview` in a new tab (full demo site rendered by `render-site`). |
| Picking | After generation the wizard goes to **Choose your template** (same cards + Preview in new tab + "Use this template"). The dashboard / editor has **Change template** at any time, with Undo. Applying saves and re-renders through the existing save path. |
| Plans | All templates are in the free trial (owner decision 2026-10-31: trial includes everything). |

## Template directions (owner request 2026-11-02: 5 more, none like another)

Why Classic and Aurelia feel the same today: both use Cormorant Garamond, a gold accent, the same demo photos
and the same gallery cover layout. Rules for every template from now on:

- **No shared display font, no shared accent color family, no shared hero layout** with any other template.
- **Own demo photo set** in the gallery (own Pexels queries that match the mood). The demo text stays the same.
- **Own signature detail** that no other template uses (listed below), done in the pack's CSS/SVG.
- At least **2 designs** for hero, services, projects, stats and testimonials, so "Change design" has choices.
- Every section type renders (own design or base), `en` + `ar` (RTL, logical CSS), phone width, no external scripts.

| Id | Feeling | Colors bg / ink / accent | Fonts Latin (display + body) · Arabic | Radius | Signature |
|---|---|---|---|---|---|
| `agenvo` Classic | Warm calm (exists) | `#f4efe6` / `#1c1c1c` / `#b8956c` | Cormorant + DM Sans | 2px | — |
| `aurelia` | Dark luxury (exists) | `#12100e` / `#f3eee4` / `#c9a962` | Cormorant + Inter | 0 | Diamond line pattern, gold hairlines |
| `arhitect` | Black cinematic tech, Swiss | `#0a0a0a` / `#ededed` / `#e5322d` signal red | Archivo (800, uppercase, wide tracking) + IBM Plex Sans · Cairo + IBM Plex Sans Arabic | 0 | All photos grayscale, color on hover/focus; giant uppercase wordmark in footer; index numbers `/01` |
| `atelier` | Light editorial magazine | `#f6f3ee` / `#1f1d1a` / `#5f6b3a` olive | Playfair Display (italic accents) + Manrope · Amiri + Tajawal | 0 | Last word of hero/section titles in italic accent (`<em>`, rendered from the text); hairline rules; diagonal photo cut; vertical rotated labels |
| `dar` | Warm soft home interior | `#efe6da` / `#3b2a20` / `#b8643c` terracotta | Fraunces + Nunito Sans · Markazi Text + Almarai | 28px | Arch-topped photos (round top), floating pill nav, soft cream cards with round icon badges |
| `nova` | Bold modern contractor, bright | `#ffffff` / `#111111` / `#ffcc00` yellow | Space Grotesk (700) + Work Sans · Readex Pro | 20px | Bento grid, yellow marker highlight behind one title word, rotated sticker badge, hazard-stripe CTA edge |
| `riwaq` | Arabic heritage, calm, symmetric | `#f7f1e3` ivory / `#0e3b33` deep green / `#23468c` lapis | Marcellus + Lato · El Messiri + Noto Kufi Arabic | 0 (arches) | Pointed-arch photo masks, 8-point-star geometric pattern bands (inline SVG), centered symmetric layout, ornament dividers |

Section by section (each template's default design first, extra designs after "/"):

| Section | arhitect | atelier | dar | nova | riwaq |
|---|---|---|---|---|---|
| Nav | Logo start, uppercase small links with numbers, thin line under | Centered wordmark, links split start/end | Floating rounded pill bar on cream | White bar, yellow pill CTA | Centered logo, links on both sides, ornament line |
| Hero | Full-bleed grayscale photo, giant uppercase title bottom-start, tagline bottom-end / split black-white | Split: serif title with italic last word + diagonal-cut photo / centered text over photo | Inset rounded photo (margin around), huge serif title centered on it / split with arch photo | Heavy headline with yellow marker word, rounded photo card + rotated sticker (first stat) / full-width photo with bold box | Centered title + large pointed-arch photo, pattern band below / two arches side by side |
| Services | Expanding image panels (focus/hover widens; stacked on phone) / numbered rows table | Vertical label + 4 columns with line icons and hairline dividers / list with em-dash | Category cards: photo top + round icon badge + label / soft icon chips | Bento grid (1 big photo card + yellow, black, grey cards) / numbered pill list | Three tall arch-topped cards / bordered tiles with star icon |
| Projects | 2-column big grid with `/01` index, place + year line / full-width list rows with hover photo | Title column + 3 cards with location in olive / carousel with tags | Arched photo strip, horizontal scroll-snap, alternate offsets / rounded masonry | Cards with tag pills + arrow buttons / large feature card + 2 small | Arch-masked grid, centered captions / alternating arch + text rows |
| Stats | Huge numbers with vertical dividers, counting / single giant number | Thin row between hairlines / numbers beside a quote | Soft rounded chips / big number in a circle | Black block, yellow numbers / sticker circles | Numbers inside 8-point-star outlines / row with ornament dividers |
| Testimonials | One big uppercase quote on an inverted white band / list of quotes with lines | Dark band, large serif quote, dots / rating summary "4.8" + quote + photo | Cream rounded cards with round avatars / one centered soft quote | Card grid with star rating / big quote in yellow block | Centered quote in an ornamental frame / two framed quotes |
| Process | Table rows with numbers and lines | 01–05 on a horizontal hairline with dots | Rounded step cards | Numbered circles joined by a line | Vertical timeline with star nodes |
| CTA | Full-width red bar, uppercase | Quiet line + underlined link | Terracotta rounded band with photo | Hazard-stripe edged black block | Green band with pattern |
| Contact | Split black / white | 3 columns: text / form / address | Rounded form card | Yellow form card on black | Centered form inside a bordered frame |
| Footer | Giant brand wordmark across the bottom | Columns with thin rules | Simple soft, rounded | Black, bold | Deep green with pattern strip |

Demo photo queries per template (gallery only; real sites use the content's own Pexels photos):
arhitect = black-and-white concrete / brutalist / minimal night buildings; atelier = bright minimalist white
houses and interiors in natural light; dar = warm beige living rooms, wood, ceramics; nova = construction
sites, cranes, workers in helmets, bright modern buildings; riwaq = Islamic arches, riad courtyards, mosaic
tiles, majlis interiors; aurelia = luxury villas at night, dark interiors; Classic keeps today's set.

## Milestones and who builds them

Token rule: important design and architecture work goes to Anthropic models; simple pages and data work go to
OpenCode (DeepSeek or GLM) when its free limit allows, otherwise Sonnet.

| # | Task | Builder | Acceptance |
|---|---|---|---|
| T0 | Finish L2: re-run API tests, commit and push | Orchestrator (Opus) | 142/142 API tests or failures proven to be network only |
| T1 | Template model: `site-templates/` registry, Classic template from agenvo, tokens per template injected as CSS variables, `applyTemplate`, content-level image needs, `services.items[].image` (after approval), `check:theme` over templates | Opus plans, **Sonnet** builds | Old sites render byte-identical as Classic; apply keeps props deep-equal; every template × fixture × locale renders without `undefined` |
| T2 | Template **Aurelia** (incl. Buildora ideas: wave edge, big-number stats, circle-icon services) | **Sonnet** | Full set of section types (own or base), RTL screenshots reviewed, no external scripts |
| T3 | Gallery: demo fixture en/ar, demo-photos script (Pexels, run once), `/templates` list + preview in new tab, landing + dashboard links | **OpenCode GLM** (fallback Sonnet) | Pages work in en/ar, mobile, dark; no AI/Pexels call at view time |
| T4 | Pick flow: wizard step "Choose your template", editor/dashboard "Change template", Undo | **Sonnet** | No AI call; content unchanged after switch; works in RTL |
| G1 | Gallery: one demo photo set per template (`photos.json` keyed by template id, own queries), gallery cover = scaled live preview of the template's demo home | **OpenCode GLM** | Each template's preview uses its own photos; covers look different |
| T5 | Template **Arhitect** (see Template directions) | **OpenCode GLM**, reviewed by Opus | As T2 + its row in Template directions |
| T6 | Template **Atelier** | **OpenCode GLM**, reviewed by Opus | As T5 |
| T7 | Template **Dar** | **OpenCode GLM**, reviewed by Opus | As T5 |
| T9 | Template **Nova** (new) | **OpenCode GLM**, reviewed by Opus | As T5 |
| T10 | Template **Riwaq** (new) | **OpenCode GLM**, reviewed by Opus | As T5 |
| T8 | Improve Classic (agenvo) weak variants: hero split, services cards with images, projects masonry, testimonials slider | **OpenCode DeepSeek** (fallback Sonnet), reviewed by Opus | `check:theme` passes, fixtures updated on purpose only |

Order: T0 → T1 → T2 → T3 → then in parallel: T4 (Sonnet, main tree) and G1 → T5 → T6 → T7 → T9 → T10 (OpenCode, one at a time, own worktree) → T8.
Each milestone is its own commit with all gates, and updates `docs/flows/templates.md`.

## Tests (never real AI, S3, email or the real DB)

- `applyTemplate` keeps every block's props, ids, order, hidden; A → B → A equals the start.
- Every template renders every section type fixture (`full` + `minimal`) in `en` and `ar` without
  `undefined`, `[object Object]` or external script tags.
- Old content with `theme: "agenvo"` renders byte-identical (Classic).
- The gallery preview page renders the demo fixture; no network call to Pexels or the AI during render.
- API: apply template → 200 and site HTML has the new template's `data-design` values; unknown template → 400;
  user B → 404.

## Owner decisions (2026-11-01)

| Topic | Decision |
|---|---|
| Schema | **Approved:** `services.items[].image` (optional), filled from Pexels at generation. |
| Gallery | **Public** `/[locale]/templates`, linked from the landing page and the dashboard. |
| Source cleanup | When all templates from `templates/` are converted (T2, T5, T6, T7 done), delete the source HTML files and reference images from `templates/` (keep `templates/README.md`). They were never committed. |
| Names | Build with the ids Aurelia, Arhitect, Atelier, Dar, Classic; the owner may rename the display names later (one place per template). |
