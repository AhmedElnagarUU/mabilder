# Owner System Plan: activity, notifications, admin dashboard, payments

Owner request (2026-10-29). Rules: `CODE_RULES.md`. Billing base: `docs/auth-billing-plan.md` (B1);
where this file disagrees with it, **this file wins**.

## Goals

1. The project owner has an **admin dashboard** to see users, their activity, feedback and payments, to
   activate / deactivate accounts and to change a user's plan by hand.
2. Customers in Egypt can pay with **local wallets** (Vodafone Cash, InstaPay, other wallets) next to
   **Polar** (cards, international).
3. The customer dashboard shows **Recent activity** instead of "Next step".
4. A separate **notifications** feature (in-app + email). The email service is not chosen yet, so
   email goes through a provider interface; the real provider is configured later.

## Decisions

| Topic | Decision |
|---|---|
| Admin isolation | The admin area is a **separate system** (owner decision 2026-10-29, binding rule in `CODE_RULES.md` §9): all admin code lives only in `src/features/admin/`, `src/app/[locale]/admin/`, `src/app/api/admin/`. Agents never touch it without the owner's explicit permission. Admin may call other features; other features never import admin. |
| Admin login | Own login, **not better-auth**: `ADMIN_EMAIL` + `ADMIN_PASSWORD` from env, session = signed HTTP-only cookie (`ADMIN_SESSION_SECRET`) that **expires after 5 hours**. The admin is not a database user. Page `/[locale]/admin/login`. |
| Inactive account | "Deactivate" sets `user.inactive = true` and revokes the user's sessions; "Activate" clears it. Data is kept. The only code outside admin: `src/features/auth/` reads `inactive`, refuses sign-in and returns 403 `account_inactive` on site APIs. |
| Admin area | `/[locale]/admin/*` (English only). Without a valid admin session, pages redirect to the admin login and admin APIs return 401. |
| Plans | Unchanged from B1: 15-day trial, one paid plan **Pro** (monthly). Access = `trial` / `active` / `expired`. |
| Subscription source | One `subscriptions` record per user with a **`provider`**: `polar`, `manual`. Access is computed from it the same way for every provider. |
| Egyptian wallets | **Manual payments** first: the customer sends money to the owner's wallet / InstaPay address shown on the billing page, then submits the transfer reference. The admin approves → Pro is active until `paidUntil` (+1 month per approved payment). A gateway (e.g. Paymob, which supports Egyptian wallets) can be added later as a new `provider` without changing access rules. |
| Manual plan change | Admin can: extend the trial to a date, grant Pro until a date (`provider: manual`), or end the plan now. Every change is written to the activity log with the admin as actor and notifies the user. |
| Price | In env only (owner decision 2026-10-29): `PRO_PRICE_EGP` (wallet payments). Not editable in the app. The Polar price lives in the Polar product. |
| Payment settings | Owner-editable in the admin area (`settings` collection): wallet numbers, InstaPay address, instructions (en + ar). No price here. |
| Activity | Append-only `activity_events` + `user.lastActiveAt` (updated at most once per 5 min per user). Used by the customer "Recent activity" card and the admin user detail. |
| Feedback | Customers send feedback from the dashboard; admin reads, marks resolved and can reply (the reply is a notification). |
| Notifications | Feature `src/features/notifications/`. `notify(userId, type, params)` stores an in-app notification and queues an email in an outbox. Email providers: `console` (logs, default in dev) and `none`; a real provider is added later behind the same interface. |
| Languages | The **admin area is English only** (owner decision 2026-10-29): plain strings, no `next-intl` keys. All customer strings (dashboard, billing, feedback, notifications, emails) stay `en` + `ar`. |

## Data model (MongoDB, mongoose)

| Collection | Fields | Indexes |
|---|---|---|
| `user` (better-auth) | + `inactive` (written only by admin), + `lastActiveAt`, `locale` | `lastActiveAt` |
| `subscriptions` | `userId`, `provider` (`polar`/`manual`), `status`, `currentPeriodEnd`, `trialEndsAt?`, `externalId?` (Polar subscription id), `updatedAt` | unique `userId`; `externalId` |
| `payments` | `userId`, `method` (`vodafone_cash`, `instapay`, `other_wallet`), `amount`, `currency` (`EGP`), `reference`, `senderPhone?`, `status` (`pending`/`approved`/`rejected`), `reviewedBy?`, `reviewedAt?`, `note?`, `createdAt` | `status+createdAt`, `userId+createdAt` |
| `activity_events` | `userId`, `actorId` (user or admin), `type`, `siteId?`, `meta` (small, no secrets), `createdAt` | `userId+createdAt`; TTL 365 days |
| `feedback` | `userId`, `message`, `rating?` (1-5), `page?`, `status` (`new`/`read`/`resolved`), `reply?`, `repliedAt?`, `createdAt` | `status+createdAt`, `userId` |
| `notifications` | `userId`, `type`, `params`, `readAt?`, `createdAt` | `userId+createdAt` |
| `email_outbox` | `notificationId`, `to`, `locale`, `type`, `params`, `status` (`queued`/`sent`/`failed`), `attempts`, `lastError?`, `nextAttemptAt` | `status+nextAttemptAt` |
| `settings` | single doc `payment`: `wallets[] {method, number, name}`, `instapayAddress`, `instructions {en, ar}` | — |

Activity types (first set): `signed_up`, `signed_in`, `site_created`, `site_generated`, `site_generation_failed`,
`content_saved`, `payment_submitted`, `payment_approved`, `payment_rejected`, `plan_changed`,
`account_deactivated`, `account_activated`, `feedback_sent`, `feedback_replied`.

Notification types (first set): `welcome`, `site_ready`, `site_failed`, `trial_ending` (3 days left),
`trial_ended`, `payment_received` (to the admin), `payment_approved`, `payment_rejected`, `plan_changed`,
`feedback_received` (to the admin), `feedback_replied`. "To the admin" = email to `ADMIN_EMAIL` (no in-app item; the admin sees counts in the admin dashboard).

## Features and files

```text
src/features/activity/        model, repository, record(event), touchLastActive(userId), list helpers,
                              components/recent-activity.tsx (customer card)
src/features/notifications/   model (notifications, email_outbox), notify(), templates/{type}.ts (en/ar subject+text+html,
                              escaped), email/provider.ts (interface), email/console.ts, email/none.ts, email/index.ts
                              (pick by EMAIL_PROVIDER), dispatch.ts (send queued, retry with backoff, max 5 attempts),
                              components/notification-bell.tsx
src/features/feedback/        model, service, components/feedback-form.tsx
src/features/billing/         (B1) + provider field, manual payments (payments model, submit/approve/reject),
                              settings, access.ts shared by all providers
src/features/admin/           guards (requireAdminPage / requireAdminApi), services (overview stats, user list query,
                              user detail, plan change, ban/unban), components/*
src/app/[locale]/admin/       page (overview), users/, users/[userId]/, payments/, feedback/, settings/
src/app/api/admin/...         route handlers only (no logic)
src/app/api/notifications/... list, mark read
src/app/api/feedback/route.ts POST
src/app/api/internal/notifications/dispatch/route.ts  POST, protected by CRON_SECRET header (for a cron job)
src/features/admin/auth/       env credentials check, signed 5-hour session cookie, guards (pages + APIs)
```

## Screens

**Customer dashboard**
- "Recent activity" card replaces "Next step": last 8 events, translated, relative time ("2 hours ago").
- Notification bell in the dashboard header: unread count, list, mark all read.
- "Send feedback" button → small dialog (message + optional rating).
- Billing page: plan state, Polar subscribe button, and **Pay with a wallet**: price in EGP, owner's wallet numbers /
  InstaPay address, form (method, amount, reference, sender phone) → "pending review"; list of own payments.

**Admin dashboard**
- Overview: total users; active today / 7 days / 30 days (by `lastActiveAt`); new sign-ups (7 days); trial / Pro /
  expired counts; sites ready / error; pending payments; new feedback.
- Users: search (name / email), filters (active, deactivated, trial, Pro, expired), sort (last active, joined),
  paginated (25). Columns: name, email, plan, site status, last active, joined.
- User detail: profile, plan with **Change plan** (extend trial / grant Pro until / end plan), **Deactivate /
  Activate**, link to the user's site preview, activity timeline, payments, feedback.
- Payments: pending queue first, approve / reject with note; history with filters.
- Feedback: inbox (new / read / resolved), reply.
- Settings: payment settings (wallets, InstaPay, instructions en/ar). The price is read-only from env.

## Rules

- Admin checks happen **on the server** in every admin page and API (never only in the proxy). Admin actions are
  written to `activity_events` with `actorId` = admin.
- An inactive user's site APIs return 403 `account_inactive` and sign-in is refused; the admin can still open their site preview from the admin area.
- Payment approval is the only way a manual payment activates Pro; the client is never trusted. Approving the same
  payment twice changes nothing (idempotent by payment id + status).
- Email sending never blocks a request: `notify()` writes the outbox; dispatch runs after the response and from the
  cron route. A failed email never fails the action.
- No secrets, passwords or full payment details in activity `meta` or logs. Emails are HTML-escaped.
- Tests never send real email, never call Polar or a payment gateway, never touch the real DB.

## Milestones (each = one delegated task)

| # | Task | Implementer | Acceptance |
|---|---|---|---|
| F1 | Bigger fonts in dashboard + editor (text only, boxes unchanged) | simple model | All text one step bigger, no layout change; gates pass |
| X1 | Activity: model, `record`, `lastActiveAt`, events from auth + site-creation, customer "Recent activity" card | Sonnet | Sign-up, create, generate, save appear in the card in en/ar; `lastActiveAt` updates at most every 5 min; API test |
| X2 | Notifications: in-app + email outbox, provider interface (`console`, `none`), templates en/ar, dispatch + cron route, bell UI | Sonnet | `notify` stores + queues; console provider logs one email; failed provider retries with backoff then `failed`; bell shows unread; cron route rejects a wrong secret |
| X3 | Admin foundation: env login + 5-hour session, guards, overview, users list, user detail, deactivate / activate | Sonnet | No admin session → admin pages redirect to admin login, admin APIs 401; wrong password refused; session expires after 5 h; deactivated user can't sign in and gets 403 on site APIs; activate restores; counts correct on a seeded `_test` DB |
| B1 | Polar (from `auth-billing-plan.md`) on the provider-based `subscriptions` model | Sonnet | As in B1, plus access computed the same for `polar` and `manual` |
| B2 | Manual wallet payments + admin payments queue + manual plan change + payment settings | Sonnet | Submit → pending; approve → Pro until +1 month, user notified, activity logged; reject → notified; double approve is a no-op; admin plan change works and is logged |
| X4 | Feedback: customer dialog, admin inbox, reply → notification | simple model | Feedback appears in admin inbox; reply notifies the user; non-admin can't read others' feedback |
| later | Real email provider (Resend / SES / SMTP; needs dependency approval), Paymob gateway for automatic wallet payments | — | — |

Order: **F1 → X1 → X2 → X3 → B1 → B2 → X4**, then back to `docs/features-v2-plan.md` (P1, U1, S1, C1, T1, G1).
X1 and X2 come first because the admin dashboard, payments and feedback all write activity and send notifications.

## Open questions (owner, not blocking X1–X3)

- Pro price: set `PRO_PRICE_EGP` in `.env`; the USD price is set on the Polar product.
- Wallet numbers / InstaPay address (entered later in admin Settings).
- Which email service later (Resend, Amazon SES, SMTP from your host…).
- Do you want Paymob (automatic Vodafone Cash / card payments in Egypt) later, instead of manual approval?
