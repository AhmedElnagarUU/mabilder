# Block designs

Stored blocks render through the design registry; old `variant` content is migrated on read.

```mermaid
flowchart TD
  A[Stored block JSON] --> B{Has design?}
  B -- yes --> C[blockSchema validates design for category]
  B -- no, has variant --> D[migrateVariant]
  D --> E[legacyDesignId: agenvo/type-variant]
  E --> C
  C -- invalid --> F[siteContentSchema rejects content]
  C -- valid --> G[renderSite / getVisibleBlocks]
  G --> H[getDesign block.design]
  H -- unknown --> I[renderBlock throws Unknown design]
  H -- found --> J[design.render block, context]
  J --> K[theme renderer e.g. renderHero]
  K --> L[renderSection: section data-block data-design]
  L --> M[renderDocument]
  M --> N[Site HTML files]
```

```mermaid
flowchart TD
  A[npm run check:theme] --> B[designs registry]
  B --> C[For each design]
  C --> D[For each fixture full/minimal]
  D --> E[For each tone]
  E --> F[For each locale en/ar]
  F --> G[buildBlock + siteContentSchema]
  G --> H[renderBlock design]
  H --> I{Root has data-block and data-design?}
  I -- no --> X[FAIL]
  I -- yes --> J{undefined or object Object?}
  J -- yes --> X
  J -- no --> K{ar page dir=rtl?}
  K -- no --> X
  K -- yes --> P[PASS]
  H -- throws --> X
  X --> R[Exit code 1]
```

Swapping a section's design in the editor (L2). Only `block.design` changes; no AI call, no credits.

```mermaid
flowchart TD
  A[SectionList: Change design button] --> B{canChangeDesign: category has 2+ designs?}
  B -- no --> B1[Button hidden]
  B -- yes --> C[DesignGallery dialog: getDesignsForCategory]
  C --> D[DesignPreviewFrame renders when visible]
  D --> E[buildDesignPreviewDocument: changeBlockDesign + renderSite with real props and locale]
  E --> F[Sandboxed scaled iframe srcDoc]
  C --> G{Escape or close?}
  G -- yes --> H[Dialog closes, nothing changes]
  C --> I[Use this design: handleApplyDesign]
  I --> J[changeBlockDesign: design only, props id order hidden kept]
  J --> K[syncPreviewSections replaces the section with new data-design]
  J --> L[Autosave: PUT /api/sites/siteId/content]
  L --> M{Owner and siteContentSchema valid? design exists for block category}
  M -- not owner --> N[404 site_not_found]
  M -- unknown design or other category --> O[400 invalid_request]
  M -- ok --> P[saveContent re-renders site HTML with new data-design]
  P --> Q[Toast: saved + Undo]
  O --> R[Toast: errors.invalid]
  Q --> S[Undo: changeBlockDesign with previous design]
  S --> L
```
