# Auth and Billing Plan: better-auth + Polar

Product view: `docs/PRD.md` §11. Rules: `CODE_RULES.md` §7.

## 1. Authentication (better-auth)

### Scope
- Email + password sign-up and sign-in, with a session cookie.
- Every site belongs to one user (`ownerId`). Users only see and change their own sites.
- **Later:** email verification, password reset (both need an email provider), social login, teams.

### Files

```text
src/features/auth/
  auth.ts                  getAuth(): creates the better-auth instance once, after connectToDatabase()
  session.ts               getSession(headers), requireSession(headers) → user or null
  auth-client.ts           createAuthClient() from "better-auth/react" (client side)
  components/sign-in-form.tsx
  components/sign-up-form.tsx
  components/sign-out-button.tsx
src/app/api/auth/[...all]/route.ts     GET/POST → (await getAuth()).handler(request)
src/app/[locale]/sign-in/page.tsx
src/app/[locale]/sign-up/page.tsx
```

### Database
- Use better-auth's MongoDB adapter with the **existing** mongoose connection:
  `mongodbAdapter(mongoose.connection.db)` inside `getAuth()`, after `connectToDatabase()`.
- `mongodb` is already installed as part of mongoose. Do not add it to `package.json`. If better-auth
  demands it as a direct dependency, stop and ask.
- better-auth owns its collections (`user`, `session`, `account`, `verification`). Our code never
  writes them directly.

### Protecting pages and APIs
- `src/proxy.ts` runs the next-intl middleware, then an **optimistic** cookie check
  (`getSessionCookie` from `better-auth/cookies`). Without a cookie, `/[locale]/dashboard/**` and
  `/[locale]/edit/**` redirect to `/[locale]/sign-in?next=<path>`. This is only a fast redirect, not security.
- **Real checks happen on the server:**
  - Dashboard/editor pages call `requireSession`. With no session, they redirect to sign-in.
  - Every site API calls `requireSession`. With no session it returns `401 { code: "unauthorized" }`.
    If the site isn't owned by the user, it returns `404 { code: "site_not_found" }` (CODE_RULES §7).
  - `/preview/[siteId]/**` is owner-only too: 404 for anyone else. Public publishing comes later.
- `site-creation/model.ts` gets `ownerId: string` (required, indexed). Every repository function takes
  `ownerId` and filters by it.

### Env
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (already in `.env.example`).

## 2. Billing (Polar)

### Plans (proposed, the owner must confirm)

| | Free | Pro (`POLAR_PRODUCT_ID_PRO`, monthly) |
|---|---|---|
| Websites | 1 | 10 |
| Languages per site | 1 | 1 or 2 (English + Arabic) |
| AI generations (create + regenerate) | 3 per month | 100 per month |
| Themes | all | all |
| Download / publish | later | later |

Limits live in **one** place: `src/features/billing/plans.ts`.

### Files

```text
src/features/billing/
  model.ts                 Subscription { userId, polarSubscriptionId, polarCustomerId, productId,
                           status, currentPeriodEnd, updatedAt }; Usage { userId, month, generations }
  repository.ts
  polar.ts                 Polar client: new Polar({ accessToken, server: POLAR_SERVER })
  plans.ts                 plan limits (table above)
  entitlements.ts          getEntitlements(userId) → { plan, maxSites, maxLocales, generationsLeft }
  service.ts               createCheckout, createPortalSession, handleWebhookEvent, recordGeneration
  components/upgrade-button.tsx  components/plan-badge.tsx
src/app/api/billing/checkout/route.ts   POST → { url }   (Polar checkout, customerExternalId = userId)
src/app/api/billing/portal/route.ts     POST → { url }   (Polar customer portal)
src/app/api/billing/webhook/route.ts    POST, Polar webhook (no session; signature verified)
src/app/[locale]/billing/page.tsx       current plan, usage, upgrade / manage buttons
```

### Rules
- **The webhook is the only source of truth for the plan.** Never trust the client or the checkout
  success redirect.
- Verify every webhook with `validateEvent` from `@polar-sh/sdk/webhooks` and `POLAR_WEBHOOK_SECRET`.
  An invalid signature returns 403.
- Handle subscription events (created, updated, active, canceled, revoked) as an idempotent **upsert**
  by `polarSubscriptionId`. Link the user through the customer's `externalId` (= our userId).
- The plan is Pro while the status is `active` (or `canceled` until `currentPeriodEnd`). Otherwise it's Free.
- `site-creation/service.ts` checks entitlements **on the server** before:
  - create site: site count
  - choosing two languages
  - generate/regenerate: generations left

  When a limit is hit, it returns `402 { code: "plan_limit_reached", limit: "sites" | "locales" | "generations" }`,
  and the UI shows a translated message with an upgrade button.
- `POLAR_SERVER` is `sandbox` in development and `production` live.
- Check the exact SDK method names against the installed `@polar-sh/sdk` types. Don't guess from memory.

### Env
`POLAR_ACCESS_TOKEN`, `POLAR_ORGANIZATION_ID`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_ID_PRO`,
`POLAR_SERVER` (already in `.env.example`).

## Milestones

| # | Task | Acceptance |
|---|---|---|
| A1 | better-auth: sign up/in/out, proxy redirect, `ownerId` on sites, owner checks on all site APIs + preview, translated auth pages | Signed-out → redirected; user A gets 404 for user B's site; all gates pass |
| B1 | Polar: plans, checkout, portal, webhook, entitlements enforced in site-creation, billing page | Sandbox checkout upgrades the user through the webhook; limits return 402 with a translated message; an invalid webhook signature returns 403 |

Order: M1 → I1 → A1 → M2 … M8, with B1 any time after A1.
