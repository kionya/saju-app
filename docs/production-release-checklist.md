# Production Release Checklist

## Current Release Candidate

- Production target branch: `main`
- Integration branch used for final sync: `codex/main-production-sync`
- Base: latest `origin/main`
- Added on top:
  - email magic-link signup/login
  - auth email template source
  - release checklist updates

## Included Product Changes

- Day 1-6 rebuild direction is reflected in the codebase.
- The app shell and design tokens are unified around `app-*` surfaces and typography.
- Home, `MY`, billing, results archive, and the saju result page use the new shell structure.
- The saju intake flow uses `/saju/new` as the primary service entry.
- Personal result URLs use UUID-based readings.
- Login supports email magic-link signup/login, with phone SMS OTP left as a documented future integration.
- Push notification routes, service worker, manifest, and cron entry are in the repo.
- `SajuDataV1` includes `orrery`-based relations, gongmang, special sals, and report evidence text.

## Verified Before Production

- TypeScript check passed:
  - `./node_modules/.bin/tsc --noEmit --pretty false --incremental false -p tsconfig.json`
- Vercel preview status: `Ready`
- Browser QA on preview home page and result page completed.
- Email magic-link signup/login was confirmed by the operator before production promotion.
- Real login flow was confirmed by the operator before production promotion.

## Go-Live Checks

- Confirm the production environment variables are present in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`
  - `WEB_PUSH_PRIVATE_KEY`
  - `WEB_PUSH_SUBJECT`
  - `CRON_SECRET`
  - `NEXT_PUBLIC_TOSS_CLIENT_KEY`
  - `TOSS_SECRET_KEY`
  - `NEXT_PUBLIC_SITE_URL`
  - If these are missing, `/api/readings` falls back to `mode: 'preview'` and `MY` pages fall back to local preview data.
- Confirm Supabase Auth provider settings:
  - Kakao OAuth enabled if Kakao remains visible on the login page.
  - Google OAuth enabled if Google remains visible on the login page.
  - Email OTP/magic-link enabled for the primary signup/login path.
  - Email template uses `supabase/templates/auth-magic-link.html` and keeps `{{ .ConfirmationURL }}` for preview-safe redirects.
  - Phone provider enabled with an SMS provider only when phone OTP is promoted from future integration to active login.
- Confirm required Supabase migrations are applied in production:
  - `001_initial.sql`
  - `002_credit_functions.sql`
  - `003_profiles.sql`
  - `004_notifications.sql`
- Confirm the push setup guide has been completed if notifications ship in this release:
  - `docs/push-notifications-setup.md`

## Production Smoke Test

- Re-check a production reading flow after deploy:
  - `/saju/new`
  - `POST /api/readings`
  - `/saju/[uuid]`
- Re-check auth/account routes after deploy:
  - email magic-link login
  - `/my`
  - `/my/profile`
  - `/my/results`
  - `/my/billing`
- Re-check the notification flow after deploy:
  - `/notifications`
  - `POST /api/notifications/test`
  - `GET /api/notifications/dispatch?dryRun=true`

## Post-Release Follow-up

- Remove or archive any remaining duplicate legacy entry points.
- Continue Day 7 with core screen rebuild refinements.
- Separate free SEO entry and core paid service metrics in analytics.
