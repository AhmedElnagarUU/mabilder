# Templates (design sources)

Put HTML/CSS website designs here. Each one is converted into a **design pack** of ready sections
(see `docs/block-library-plan.md`). Nothing in this folder is served or imported by the app; lint and
TypeScript ignore it.

## How to add a template

```text
templates/
  <pack-name>/            short lowercase name, e.g. noor
    index.html            the home page (other pages optional: about.html, services.html…)
    css/…                 stylesheets
    js/…                  scripts (optional)
    assets/…              fonts, images, icons
    notes.md              optional: which part is the hero, services, projects…; anything to keep or drop
```

## What happens next

1. Each part of the page is matched to a section category (hero, services, projects, contact…).
2. Each part becomes a section design that reads the same content as every other design of its category,
   so a customer can switch designs without losing text or photos.
3. Colors and fonts become style tokens, so designs from different templates can sit on one site.
4. Anything that has no matching category is listed for your approval before it is added.

Use only templates you have the right to use (your own, or licensed for this kind of product).
