# Product Requirements: nextbuilder

Status legend: **[v1]** = building now · **[later]** = planned, not started

## 1. What it is

A website builder made for **architecture, interior design, decoration, engineering, and
construction businesses**. The customer gives a short description of their business and whatever
real material they have: logo, projects, team, clients, awards. The system builds a complete,
professional website from **blocks**, writes the copy with AI, fills missing photos from Pexels,
and lets the customer edit, reorder, and hide blocks.

## 2. Target customers

- Architecture studios and engineering offices
- Interior design and decoration companies
- Construction and contracting companies
- Small firms and freelancers in these fields, often with little written content

These businesses sell through **visual proof**: finished projects, photos, and track record. The
website must put their projects first when they have them, and still look complete when they don't.

## 3. Problems we solve

1. They don't have time to write website copy. AI writes it from a short brief.
2. They often have only part of the content, such as no team photos and no awards. The site must
   never show empty or fake sections.
3. Generic builders aren't made for their industry. Our blocks and themes are.

## 4. Core principles

1. **Never invent facts.** Numbers, client names, awards, people, projects, dates, and addresses come
   only from the customer. The AI only writes descriptive copy.
2. **Correct with little data.** A customer who gives only a name, industry, and description still gets
   a correct, good-looking site, even if it's a one-page site.
3. **More data = richer site.** Each real piece of data unlocks more blocks and pages.
4. **Content is separate from design.** Switching theme never loses content.

## 5. Customer data

### 5.1 Brief (wizard) [v1]
Required: business name, industry, description.
Optional: services, audience, location, tone, email, phone, website, years in business,
project count, notable clients, awards, extra details.

### 5.2 Profile material
| Data | Unlocks | Status |
|---|---|---|
| Logo (image upload) | logo in nav/footer instead of text name | [later] needs S3 upload |
| Projects: title, category, location, year, description, photos | projects block, projects page, featured project | [v1] fields, [later] photo upload |
| Team members: name, role, bio, photo | team block | [later] |
| Testimonials: quote, author, company | testimonials block | [later] |
| Clients (names) | clients block | [v1] |
| Awards (year + title) | awards block | [v1] |
| Years in business, project count | stats, timeline | [v1] |
| Address | location block | [v1] |

Uploads use S3 presigned PUT (see `CODE_RULES.md` §7). Until uploads exist, project photos come from
Pexels and are marked as illustrative.

## 6. How a site is built [v1]

```
brief + profile data
  → facts (code, no AI)
  → business profile (AI: positioning, tone, keywords)
  → composition (rules: which pages + which blocks in which order)
  → copy (AI writes only "copy" blocks)
  → images (customer photos first, Pexels for the rest)
  → render with chosen theme → static HTML/CSS/JS
```

Details: `docs/block-system-plan.md`.

## 7. Website output [v1]

- Static HTML/CSS/JS per site. It has no runtime dependency on our app.
- Pages are chosen by rules: Home, About, Services, Projects, Contact. Thin data gives a single page.
- Preview at `/preview/{siteId}/index.html`.

## 8. Editor [v1]

- Edit text inline on the live preview.
- Replace images.
- **Reorder** blocks (move up/down) and **hide** blocks the customer doesn't want. Hidden blocks can be
  restored.
- A fact block can only be shown if its data exists.
- "Regenerate copy" rewrites text but keeps the customer's block order, hidden blocks, and edits to facts.

## 9. Themes

- [v1] One theme: **Agenvo** (editorial, calm; fits architecture/interiors).
- [later] More themes, added by developers through the **theme import pipeline**: an agent converts an
  HTML/CSS template from `theme-sources/<name>/` into a theme. See the plan.
- [later] Theme picker in the wizard and the editor.

## 10. Languages: Arabic and English [v1]

The product serves customers in Arabic- and English-speaking markets.

- **App UI** (landing, dashboard, wizard, editor) is available in English and Arabic, at `/en/…` and
  `/ar/…`. Arabic is right-to-left. A language switcher keeps the current page.
- **Each generated website is English, Arabic, or both**, chosen by the customer in the wizard. For
  two languages, the customer also picks the default one. The AI writes the copy in the default language
  and translates it into the second. Arabic renders right-to-left. A two-language site has a language
  link on every page that opens the same page in the other language. Customer facts (names, numbers)
  are shown as entered.
- Block order and hidden blocks are shared by both languages. The customer arranges the site once.
- English, Arabic, or both are available in the trial and in Pro.

Technical design: `docs/i18n-plan.md`.

## 11. Accounts and plans [v1]

- **Accounts:** customers sign up and sign in with email and password (better-auth).
- **One website per account.** An account is one business, so it has exactly one website. Nobody else
  can see, edit, or preview it.
- **15-day free trial** from sign-up, with no card needed and every feature included.
- **One paid plan (Pro), monthly through Polar.** Customers subscribe through Polar checkout and manage
  or cancel through the Polar customer portal.
- **AI is included** in the trial and in Pro, limited by **daily credits**: 20 per rolling 24 hours.
  Rewriting one section costs 1 credit. The first generation of a site is free. Failed AI calls are
  not charged.
- **After the trial without a subscription**, the website is kept and can still be previewed, but
  editing and AI generation are locked. The customer sees a clear message in their language with a
  subscribe button.
- [later] Email verification, password reset, social login, team accounts.

Technical design: `docs/auth-billing-plan.md`.

## Out of scope for v1 (planned later)

- File uploads (S3): logo, project photos, team photos
- Publishing to a public domain / custom domains
- Customers uploading their own templates

## 12. Success criteria for v1

- A brief with only the required fields produces a complete site with no empty or fake sections.
- A rich brief produces a multi-page site where every fact on the page comes from the customer.
- The customer can reorder and hide blocks, and changes survive a copy regeneration.
- Every block in the Agenvo theme renders with full, minimal, and empty-optional sample data.
- The app UI works in English and Arabic (RTL), and an Arabic website renders correctly right-to-left.
- A customer can make a website in English, Arabic, or both, with a working language link.
- A customer only ever sees their own website. One website per account, a 15-day trial, and the
  subscription lock are all enforced on the server.
