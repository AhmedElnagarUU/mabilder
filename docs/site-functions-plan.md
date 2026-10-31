# Site Functions Plan: from profile site to a site that brings work

Owner request (2026-10-31). Rules: `CODE_RULES.md` (binding, incl. §11 flow diagrams). The owner approved this plan
and the block schema changes it lists. Live chat and online payments are **out of scope**.

## Goal

Visitors of a generated website can **ask for work**: request a quote, ask for a consultation or site visit, message
on WhatsApp, and leave a review. Each request lands in the site owner's **Inbox** in the dashboard with a
notification. Nothing here calls the AI, so visitor traffic costs nothing.

Customers are architecture, interior design and contracting firms (PRD §2). They sell big jobs that start with a
phone call, so every form asks for a **phone number** and only a few qualifying fields.

## Architecture

```text
generated site (static HTML)  ──POST JSON──▶  /api/public/sites/{siteId}/inquiries  ──▶  inquiries service
   + site.js (existing file,                   (no login, CORS, spam checks)              ├─ save (Mongo)
     extended)                                                                             └─ notify(owner)
dashboard /dashboard/inbox  ◀── GET/PATCH /api/sites/{siteId}/inquiries (owner only) ◀───┘
```

| Topic | Decision |
|---|---|
| Feature folder | `src/features/inquiries/` (model, repository, service, types, components). Public route `src/app/api/public/sites/[siteId]/inquiries/route.ts`; owner routes under `src/app/api/sites/[siteId]/inquiries/`. |
| How the site knows where to send | `render-site` writes `data-site-id` and `data-endpoint` (from `NEXT_PUBLIC_APP_URL`) on `<body>`. The existing `site.js` form handler sends `fetch` with JSON; on success it shows the success message, on error a short error message. Without JS the form posts as a normal form to the same endpoint, which redirects back with `?sent=1`. |
| Data model `Inquiry` | `siteId`, `ownerId`, `kind` (`quote` \| `visit` \| `review`), `name`, `phone`, `email?`, `message?`, `service?`, `location?`, `area?`, `budget?` (range key), `startWhen?` (range key), `preferredDay?`, `preferredTime?` (`morning` \| `evening`), `projectSlug?`, `rating?` (1–5, reviews only), `locale`, `status` (`new` \| `contacted` \| `won` \| `lost`; reviews: `pending` \| `approved` \| `hidden`), `createdAt`. Text fields are capped (name 80, message 2000…) by zod. |
| Validation | One zod schema per kind; phone must look like a phone (digits, spaces, `+`, 7–20 chars). Unknown fields rejected. |
| Spam | (1) Hidden honeypot field: filled means accept silently, store nothing. (2) Rate limit: max 5 submissions per site per visitor per hour and 200 per site per day, counted in Mongo by `sha256(ip + siteId + secret)` (never store raw IPs). (3) Minimum fill time: the form carries its render time; under 3 s is rejected silently. (4) Cloudflare Turnstile is a later option, only if spam appears. |
| CORS | Public route answers `OPTIONS` and allows any origin, POST only, no cookies (the published domains are unknown in advance). |
| Notification | New notification type `inquiry_received` (en + ar) through the existing `notify()`. Email later with the real provider. |
| Site disabled | If the site is missing, deleted, or the owner is `inactive`: the route returns 404 and stores nothing. |
| Privacy | Inquiries are visible only to the site owner (user B gets 404). Each site gets a short note under the form: "We only use your details to reply to you." |
| Tests | Never AI / S3 / email / real DB. Notification is checked in the `_test` DB. |

## Milestones

### W1 Inbox + quote request + WhatsApp

1. **Quote form (contact block).** The owner approves this schema change: add optional fields to the contact form
   props: `phonePlaceholder`, `serviceLabel`, `locationPlaceholder`, `budgetLabel`, `startLabel`, `privacyNote`,
   `errorMessage`. The AI writes the labels like any other copy. The **service options come from the site's services**
   (facts, never AI). Budget and start options are fixed en/ar label sets in code (e.g. start: "within a month",
   "1–3 months", "later"). Required: name + phone. Email, message and the rest are optional. Fix the demo text "no
   message is actually sent" in the fixtures and prompts.
2. **Public endpoint** with validation, honeypot, rate limit, minimum time, CORS, and inactive/deleted checks.
3. **site.js:** real submit with a loading state, success and error. Keep the no-JS fallback.
4. **WhatsApp button:** a floating button on every page when the site has a phone number. It opens
   `https://wa.me/<digits>?text=<prepared message in the page language>`. Logical CSS: bottom-end corner, works in
   RTL. A dashboard setting turns it on or off (default on), with an optional separate WhatsApp number. No backend.
5. **Dashboard Inbox** (`/dashboard/inbox`, sidebar item with a count of new inquiries):
   - a list with newest first, filter by status, and a details panel;
   - click-to-call (`tel:`) and "Reply on WhatsApp" links;
   - status change and delete;
   - en + ar, an empty state, and a tour step (G1 pattern).
6. **Admin numbers** (owner-approved admin change, see Owner decisions): request counts on the admin overview and user detail.
7. **Flow:** `docs/flows/inquiries.md`.

Tests:
- **API:** valid quote saved and owner notified; missing phone gives 400; honeypot stores nothing (but returns 200);
  the 6th submission in an hour gives 429; an inactive owner's or unknown site gives 404; the owner lists and
  updates statuses; user B gets 404; CORS preflight is OK.
- **Pipeline:** the rendered contact form has the service options from facts, the honeypot, and `data-endpoint`; the
  WhatsApp link has only digits and an encoded text, and is absent without a phone.

### W2 Consultation / site-visit request + "Ask about this project"

1. A new `kind: "visit"` form: name, phone, service, location, preferred day (date input, today or later) and time
   (morning/evening), note.
   - It shows as a second tab or button in the contact section ("Request a quote" / "Book a site visit").
   - It is only a request, with no calendar and no confirmation flow. The owner calls back.
2. **Project pages (P2):** an "Ask about this project" button opens the contact page with `?project=<slug>`, and
   the form pre-fills a hidden `projectSlug` plus a visible note "About: <project title>". The inbox shows the
   project.
3. Inbox: show the kind badge and the preferred day/time.
4. Flow diagram updated.

Tests: visit with a past day gives 400; `projectSlug` must belong to this site or is dropped; the inbox shows the
kind.

### W3 Reviews with owner approval

1. A "Leave a review" form on the site: name, rating 1–5, comment (max 600), optional project. It is stored as
   `pending`.
2. Inbox → **Reviews** tab: approve, hide, delete. Only approved reviews are shown on the site.
3. **Site display:** the existing testimonials block shows approved reviews as **fact data** (the customer's real
   words, never AI-written or AI-edited). When there are no approved reviews, the block keeps today's behaviour.
   Approving or hiding a review re-renders the site (like the projects refresh). Show the average stars only when
   there are at least 3 approved reviews.
4. **Spam:** same checks as W1, plus max 1 review per visitor per site per day.
5. Flow diagram updated.

Tests: a pending review is not rendered; an approved one is rendered and escaped (HTML in the comment shows as
text); hidden goes away after re-render; the average shows only with 3 or more reviews; AI output never touches
review text.

## Order and dependencies

- L1 (design registry) and R1 (first result) land first: both touch the contact block and composition.
- Then W1 → W2 → W3, each its own commit with all gates.
- **Real visitors** need public publishing (not built yet; PRD "Out of scope for v1"). Until then everything works
  and is testable in the preview, and the endpoint is designed to need no change when publishing arrives.

## Owner decisions (2026-10-31)

| Topic | Decision |
|---|---|
| Plans | The **15-day free trial includes everything** (Inbox, all forms, WhatsApp, reviews), so the customer sees the full value. After the trial without Pro, the site follows the existing locked rules: requests are still **saved** (never lost), but the Inbox shows the count and asks the customer to subscribe to read them. |
| Retention | Valid requests are kept **12 months**, then deleted automatically (a Mongo TTL index on `createdAt`). Requests marked as spam are deleted after **30 days**. |
| Notification | The owner gets a notification for **every** valid request (`inquiry_received`, en + ar). Spam never notifies. |
| Admin numbers | The owner explicitly asks for this admin change (CODE_RULES §9): the admin overview shows requests in total, today, 7 days and 30 days, valid vs spam, and the top sites by requests. The admin user detail page shows that user's request counts. **Counts only**: the admin never sees visitor names, phones or messages (customer privacy). Admin reads through an inquiries service function; inquiries never import admin. |

## Spam validation (all milestones)

Each request gets a **spam check** before it is saved. The result is `valid` or `spam` with a reason code (e.g.
`honeypot`, `too_fast`, `rate_limit`, `bad_phone`, `links`, `duplicate`). The reason codes are stored, so the admin
numbers show why requests were blocked.

1. **Silent drops (not stored):** honeypot filled; form sent under 3 s after render; over the rate limit (5 per
   visitor per site per hour, 200 per site per day; the visitor is identified by a hashed IP, raw IPs are never
   stored).
2. **Phone check:** the number is normalised to digits. Egyptian mobile (`01[0125]` + 8 digits, or `+20…`) or an
   international `+` number with 8–15 digits is accepted; anything else returns 400 with a clear message on the form.
3. **Content check (stored as spam, not shown as new):**
   - the message contains links (`http`, `www.`, more than one URL);
   - the same phone number sent to the same site within 24 h (duplicate: kept once, counted);
   - text that is mostly non-letters, or a name that contains a URL.
4. **Owner control:** in the Inbox, "Mark as spam" / "Not spam". A spam request is hidden from the main list under a
   "Spam" filter so the owner can rescue a real one.
5. **Later, only if spam grows:** Cloudflare Turnstile ("I'm not a robot" without puzzles, free). It needs owner
   approval and its env keys.

Tests: each reason code is produced by its case; spam does not notify; valid notifies; "Not spam" moves the request
back and notifies nothing twice; TTL indexes exist on the model.
