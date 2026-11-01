# Flow: templates (pick a template after the content is written)

Plan: `docs/templates-plan.md`. Status: **planned** (T1–T8 not built yet). This file is updated in each milestone.

## In plain words

**1. The content comes first.** The customer fills in the brief. The AI writes the text for every section
(hero, services, projects, contact…), the SEO title and description, and the system searches Pexels for photos
that match the business. All of this is saved as the site's **content**. The content has the same shape for
every template: each section has a type (for example "services") and the fields that type always has.

**2. Then the customer picks a template.** A template is a ready look: colors, fonts, spacing, the top menu and
footer, and one design for each type of section. Every template knows how to show every section type, so any
content fits any template. If a template has no own design for a section type, it uses the basic design, which
still takes the template's colors and fonts.

**3. Looking at templates costs nothing.** The gallery shows each template with fixed demo text and fixed demo
photos (chosen once by us). "Preview" opens the full demo site in a new tab. No AI and no Pexels search happen
when someone looks at the gallery.

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
    C --> D[fill-images: Pexels search per content image need]
    D -->|Pexels fails| D2[Keep section without photo, design hides empty image]
    D --> E[(Mongo: site content saved, template = Classic)]
    D2 --> E
    E --> F[Wizard step: Choose your template]

    G[Visitor or customer opens /templates gallery] --> H[Template cards from site-templates registry]
    F --> H
    H --> I[Preview button]
    I --> J[New tab /templates/id/preview]
    J --> K[render-site with demo fixture and fixed demo photos]

    H --> L[Use this template]
    L --> M[applyTemplate: set theme, map each block to template design]
    M --> N[PUT /api/sites/siteId/content]
    N --> O{zod: template and designs valid?}
    O -->|no| P[400, nothing saved]
    O -->|yes| Q[(Mongo: content saved, props unchanged)]
    Q --> R[render-site: tokens + shell + designs to static HTML]
    R --> S[Editor preview shows the new look, toast with Undo]
    S -->|Undo| M
    S --> T[Optional: Change design on one section, L2]
```
