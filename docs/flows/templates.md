# Flow: templates (pick a template after the content is written)

Plan: `docs/templates-plan.md`. Status: **T1 built** (template model, Classic, `applyTemplate`, content-level
image needs), **T2 built** (template Aurelia) and **T3 built** (public template gallery with live demo previews).
**T4 built** (pick flow). More templates (T5–T10) and T8 are not built yet. This file is updated in each milestone.

**T4, in plain words:** right after the AI has written the content, the wizard sends the customer to
"Choose your template" (`/{locale}/dashboard/sites/{siteId}/template`). It shows every template card (name, mood,
cover). "Preview" opens the customer's **own** content in that template in a new tab
(`GET /api/sites/{siteId}/template-preview/{templateId}/...`, owner only, rendered on the fly, nothing saved, the
contact form has no real endpoint). "Use this template" calls `POST /api/sites/{siteId}/template`
(`{ templateId }`): the server loads the saved content, runs `applyTemplate`, and saves it through the same save as
the editor (`saveContent`: validate, store, rebuild the site). Then the customer lands in the editor. "Skip" keeps
the current look (Classic). In the editor, "Change template" in the top bar opens the same cards in a dialog (a
dialog, not a page, so the editor keeps its state and can show Undo). After a pick the editor swaps in the returned
content, reloads the preview, and shows a toast with Undo for 8 seconds; Undo puts back the old theme and designs
(`restoreLook`, keeps edits made meanwhile) and saves with the normal content save. Nothing here calls the AI,
credits or Pexels. Files: `site-editor/template-service.ts`, `template-preview.ts`, `restore-look.ts`,
`template-choice.ts`, `components/{choose-template,template-choice-list,template-dialog}.tsx`,
`templates-gallery/template-choices.tsx`.

**T3, in plain words:** a public gallery page at `/[locale]/templates` shows one card per template, each with a
small CSS mock of the demo home page, the template name and its mood text in the visitor's language, and an
"Open preview" link that opens `/{locale}/templates/{id}/preview` in a new tab. The preview route renders the
fixed demo studio ("Masar Studio", bilingual English/Arabic, photos from Pexels saved once in the fixture) with
that template, injects a `<base>` tag so the demo's own internal links keep working, and adds a small visible
ribbon saying it is a demo with a link back to the gallery. Theme styles and scripts for the preview are served
by the same route (`.../preview/assets/site.css` and `site.js`). Nothing calls the AI, Pexels or the database
when the gallery or a preview is opened, and pages are served cache-friendly. Files:
gallery page `src/app/[locale]/templates/page.tsx`, preview
`src/app/[locale]/templates/[id]/preview/[[...file]]/route.ts`, demo fixture
`src/features/templates-gallery/demo/demo-content.ts` (+ `photo-slots.ts`, `photos.json`, dev script
`scripts/templates-demo-photos.ts` / `npm run templates:demo-photos`), rendering in
`src/features/templates-gallery/preview.ts`, components in `src/features/templates-gallery/components/`.

**Aurelia (T2), in plain words:** a dark luxury look: charcoal pages, thin gold lines, a faint diamond pattern over
the hero photo, big gold serif titles with one italic line, and a gold-outlined menu button. It has its own menu,
footer and style file (no outside scripts), a wave edge under the hero and above the numbers, and extra layouts:
circle-icon services, photo panels, a big-number band and project cards with facts. Every section type has an
Aurelia design, so any content fits. Preview locally with `npm run templates:render-sample -- aurelia`
(writes `.template-samples/aurelia/`).

Built in T1: `site-templates/` (registry, Classic = id `agenvo`), `applyTemplate` in `site-editor/apply-template.ts`,
`content.theme` validated as a template id, template colors and fonts written as CSS variables in the page head
(nothing extra for Classic, so old sites render the same bytes), and `services.items[].image` filled from Pexels.

## In plain words

**1. The content comes first.** The customer fills in the brief. The AI writes the text for every section
(hero, services, projects, contact…), the SEO title and description, and the system searches Pexels for photos
that match the business. All of this is saved as the site's **content**. The content has the same shape for
every template: each section has a type (for example "services") and the fields that type always has.

**2. Then the customer picks a template.** A template is a ready look: colors, fonts, spacing, the top menu and
footer, and one design for each type of section. Every template knows how to show every section type, so any
content fits any template. If a template has no own design for a section type, it uses the basic design, which
still takes the template's colors and fonts.

**3. Looking at templates costs nothing.** The public gallery at `/{locale}/templates` shows each template with
fixed demo text and fixed demo photos (chosen once by us, then stored in `photos.json`). "Open preview" leads to
`/{locale}/templates/{id}/preview`, which renders the whole demo site (all pages and project stories) in a new
tab. No AI, no Pexels search and no database call happen when someone looks at the gallery or a preview; the
preview shows a visible demo ribbon instead of a working contact form.

**4. Applying a template only changes the look.** When the customer clicks "Use this template", the system sets
the template on the site and gives every section that template's design. The text, photos, services, projects,
reviews and section order do not change. The site is saved and rebuilt right away. Undo brings the old template
back.

**5. Changing your mind is free.** The customer can change the template at any time from the dashboard or the
editor, and still change one section alone with "Change design" (L2).

## Flowchart

```mermaid
flowchart TD
    A[Customer submits brief in wizard] --> B[POST /api/sites/siteId/generate]
    B --> C[site-creation: AI writes content per section type]
    C --> D[fillImages: Pexels search per block-type image need, services one per title]
    D -->|Pexels fails| D2[Keep section without photo, design hides empty image]
    D --> E[(Mongo: site content saved, content.theme = agenvo = Classic)]
    D2 --> E
    E --> F[create-site-wizard router.push /dashboard/sites/siteId/template - ChooseTemplate page]

    G[Visitor opens /[locale]/templates - src/app/[locale]/templates/page.tsx] --> H[Template cards: templates-gallery components, listTemplates]
    F --> H
    H --> I[Open preview link, open in new tab]
    I --> J[New tab /[locale]/templates/id/preview/[[...file]] route.ts - generateStaticParams from listPreviewParams]
    J --> K[preview.ts: applyTemplate on demo fixture Masar Studio, renderSite, base href tag, demo ribbon]
    K --> K2[assets/site.css and assets/site.js read from theme folder in the same route]

    F --> F1[TemplateChoiceList cards: buildTemplateChoices]
    F1 --> F2[Preview, new tab: GET /api/sites/siteId/template-preview/templateId/... route.ts]
    F2 --> F3{session owner of site and known template?}
    F3 -->|no| F4[404]
    F3 -->|yes| F5[renderOwnerTemplatePreview: applyTemplate on own content, renderSite, base href, no endpoint]
    F --> F6[Skip: keep current look, go to /edit/siteId]
    X[Editor top bar: Change template] --> Y[TemplateDialog: same TemplateChoiceList]

    F1 --> L[Use this template: requestTemplate]
    Y --> L
    L --> L1[POST /api/sites/siteId/template template/route.ts]
    L1 --> L2{session? templateId zod + isTemplateId? owner?}
    L2 -->|no session| L3[401]
    L2 -->|unknown template| L4[400]
    L2 -->|not owner| L5[404]
    L2 -->|ok| M[applyTemplateToSite: getSite, applyTemplate: set content.theme, map each block to getTemplateDesign, base design if none]
    M --> N[saveContent: same path as PUT content]
    N --> O{siteContentSchema: theme is a registered template id, designs valid?}
    O -->|no| P[400, nothing saved]
    O -->|yes| Q[(Mongo: content saved, props unchanged)]
    Q --> R[generateSite: renderSite with shell theme, tokens as :root variables, designs to static HTML]
    R --> S[Wizard: router.push /edit/siteId. Editor: SiteEditor swaps content, canvas remounts, toast with Undo 8s]
    S -->|Undo| U[restoreLook: old theme + designs, keep newer edits]
    U --> V[saveContent: PUT content, then canvas remounts]
    S --> T[Optional: Change design on one section, L2]
```
