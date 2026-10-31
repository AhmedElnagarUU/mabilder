# Inquiries (W1): website requests, WhatsApp button, Inbox, admin counts

A visitor of a generated website sends a quote request; it is spam-checked, saved, and shown in the owner's Inbox with a notification. The admin sees counts only.

```mermaid
flowchart TD
  V[Visitor fills the contact form] --> JS{JavaScript on?}
  JS -- yes --> SJ[site.js: JSON fetch with elapsedMs, loading state]
  JS -- no --> FP[Plain form post to data-endpoint]
  SJ --> R[POST /api/public/sites/siteId/inquiries]
  FP --> R
  R --> S[submitInquiry in inquiries/service.ts]
  S --> O{Site exists and owner active?}
  O -- no --> N404[404 site_not_found, nothing stored]
  O -- yes --> H{Honeypot filled or under 3 s?}
  H -- yes --> SD[200 ok, nothing stored]
  H -- no --> Z{zod fields and normalizePhone valid?}
  Z -- no --> B400[400 invalid_request shown as form error]
  Z -- yes --> RL{5 per visitor per hour or 200 per site per day?}
  RL -- over --> B429[429 rate_limited, nothing stored]
  RL -- ok --> SP{findContentSpam or same phone in 24 h?}
  SP -- spam --> SS[Save spam=true with spamReason, expires in 30 days]
  SP -- valid --> SV[Save valid request, expires in 12 months]
  SV --> NT[notify owner: inquiry_received en/ar]
  SS --> WA[No notification]
  SV --> OK[200 ok, or 303 back with ?sent=1 for form posts]
  SS --> OK
  NT --> IB
  OK --> M[site.js shows the thank-you message]
  IB[Owner opens /dashboard/inbox] --> GI[getInbox: owns site? access state]
  GI -- trial or Pro --> LST[InboxList: filter, details, tel and wa.me links]
  GI -- expired --> LCK[InboxLocked: count and Subscribe, requests keep saving]
  LST --> PA[PATCH or DELETE /api/sites/siteId/inquiries/inquiryId]
  PA --> US[updateInquiryState: status, Mark spam, Not spam, delete]
  US -- Not spam on a never-notified request --> NT
```

Admin counts and the WhatsApp button:

```mermaid
flowchart TD
  A[Admin opens overview or a user page] --> GO[getOverview / getUserDetail in admin/service.ts]
  GO --> GS[getInquiryStats / getInquiryCountsForOwner in inquiries/service.ts]
  GS --> DB[(inquiries collection: counts only)]
  DB --> AV[OverviewCards and UserDetailView show numbers, never names, phones or messages]
  W[Owner toggles WhatsApp in the Inbox page] --> WP[PUT /api/sites/siteId/whatsapp]
  WP --> SW[saveWhatsapp in site-creation/service.ts]
  SW --> GN[generateSite renders the site again with the new setting]
  GN --> BTN[renderWhatsAppButton: wa.me with digits and encoded text, only when there is a phone]
```
