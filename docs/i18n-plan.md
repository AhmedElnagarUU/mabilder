# i18n Plan: Arabic + English

Product view: `docs/PRD.md` §10. Rules: `CODE_RULES.md` §6.

There are **two separate language systems**. Don't mix them:

| | 1. App UI | 2. Generated customer websites |
|---|---|---|
| What | landing, dashboard, wizard, editor | the static HTML sites we generate |
| Who picks the language | the visitor (URL `/en/…` or `/ar/…`) | the customer, per site: English, Arabic, or both |
| Where text comes from | `src/messages/en.json` + `ar.json` via `next-intl` | block props, written by AI in the site's language |
| RTL | `<html dir="rtl">` + logical Tailwind classes | the theme's document sets `dir="rtl"`; themes use logical CSS |

## 1. App UI (next-intl)

### Library
`next-intl` (approved in `CODE_RULES.md` §4). Version 4.x supports Next 16.

### Locales
- `en` (default) and `ar`.
- Prefix always: `/en/dashboard`, `/ar/dashboard`.
- `/` redirects to the best match from `Accept-Language`, falling back to `/en`.

### Files

```text
src/shared/i18n/
  routing.ts          defineRouting({ locales: ["en", "ar"], defaultLocale: "en", localePrefix: "always" })
  request.ts          getRequestConfig: validates the locale, loads src/messages/<locale>.json
  navigation.ts       createNavigation(routing) → Link, redirect, usePathname, useRouter
  direction.ts        getDirection(locale) → "rtl" | "ltr"
  locale-switcher.tsx client component: switches en ⇄ ar on the same path
src/messages/
  en.json
  ar.json             same keys as en.json, always
src/proxy.ts          next-intl middleware (Next 16 calls middleware "proxy"; file is proxy.ts)
next.config.ts        wrapped with createNextIntlPlugin("./src/shared/i18n/request.ts")
```

`i18n` lives in `src/shared/` because every feature with UI uses it, and it holds no domain logic.

### Routes after the move

```text
src/app/
  [locale]/
    layout.tsx               <html lang={locale} dir={dir}>, fonts, NextIntlClientProvider
    page.tsx                 landing
    dashboard/page.tsx
    dashboard/new/page.tsx
    edit/page.tsx
    edit/[siteId]/page.tsx
    not-found.tsx
  api/**                     NOT localized
  preview/[siteId]/[...file] NOT localized (serves generated sites)
  globals.css  favicon.ico   stay at app root
```

- Every `[locale]` layout and page calls `setRequestLocale(locale)` so pages can stay static.
  `generateStaticParams` returns both locales.
- The proxy matcher skips `api`, `preview`, `_next`, and files with an extension.
- Server components use `getTranslations`. Client components use `useTranslations`.
- Internal links use `Link` from `src/shared/i18n/navigation.ts`, never `next/link`, so the locale is kept.

### Message keys
Namespaced by feature. The key names say where the text is used, not what it says:

```json
{
  "common":       { "save": "Save", "cancel": "Cancel", "language": "العربية" },
  "landing":      { "hero": { "title": "...", "cta": "..." } },
  "dashboard":    { "title": "...", "empty": "...", "status": { "draft": "...", "ready": "..." } },
  "siteCreation": { "steps": { "basics": { "title": "...", "description": "..." } }, "fields": { ... }, "errors": { ... } },
  "editor":       { ... }
}
```

- `en.json` and `ar.json` always have the same keys. `npm run check:messages` fails when they differ.
- Page `metadata` uses `generateMetadata` + `getTranslations`.
- API routes return a stable `code` with every error, e.g. `{ "error": "…", "code": "site_not_found" }`.
  The UI shows a translated message for that code. The English `error` text is only for logs and debugging.

### RTL and fonts
- `dir="rtl"` on `<html>` for Arabic.
- Logical classes only: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`.
  Arrows and chevrons get `rtl:rotate-180`.
- Arabic font: `IBM_Plex_Sans_Arabic` from `next/font/google`, used when the locale is `ar`. Latin fonts stay as they are.

## 2. Generated customer websites

- The customer chooses **English only, Arabic only, or both**, plus the default language for a
  two-language site. Stored as `SiteContent.locales` + `defaultLocale`. The wizard defaults to the
  current UI locale.
- Layout is shared and text is per language: each block's `props`, each page's `meta`, `nav` and
  `footer` are stored per locale (see `docs/block-system-plan.md`, "Site content").
- The AI writes the default language, then translates page by page into the second one. Facts (names,
  numbers) are kept as the customer typed them.
- Two-language output: `en/…`, `ar/…`, and a root redirect to the default language. The nav has a
  language link to the same page in the other language.
- The theme's `renderDocument` sets `<html lang dir>`. A theme must look right in RTL:
  - Use logical CSS, avoiding `left`/`right`, `ml`/`mr`, and so on.
  - Load an Arabic-capable font when `locale` is `ar`.
- Theme render files contain no text (CODE_RULES §8), so a theme needs no translation files. Small
  fixed labels like the menu button or photo credits are props in `nav` / `footer`.
- `scripts/check-theme.ts` also renders an `ar` sample with `dir="rtl"` and a two-language sample.

## Milestone I1 (one delegated task)

Covers app UI i18n for landing, dashboard, and wizard, plus routing:
1. Install `next-intl`, add `src/shared/i18n/*`, `src/proxy.ts`, and wrap `next.config.ts`.
2. Move pages under `src/app/[locale]/`. API and preview routes don't move.
3. Move every user-facing string in landing, dashboard, wizard, and shared UI into `en.json`/`ar.json`.
4. Add the language switcher to the landing header and the dashboard header.
5. Add API error codes, and have the UI map them to translations.
6. Add `scripts/check-messages.ts` + `npm run check:messages`.

The editor gets the `[locale]` route in I1, but its strings are translated in **M7**, when it is rebuilt for blocks.

Acceptance:
- `/` → `/en`. `/ar/dashboard` renders RTL in Arabic.
- The switcher keeps the current page.
- No hardcoded user-facing strings in landing, dashboard, or wizard.
- lint, tsc, generator tsc, `check:messages`, and build all pass.
