# Production Release Checklist

## Current Release Candidate

- Local release branch: `codex/production-prep`
- Release candidate commit: `b5d9fa08a549e2affb8c6a16458e70ff33fde358`
- Preview branch pushed for verification: `codex/production-prep`
- Latest preview deployment:
  `https://saju-o34dx5t9j-kbeautys-projects.vercel.app`
- Branch alias URL:
  `https://saju-app-git-codex-production-prep-kbeautys-projects.vercel.app`

## Included Product Changes

- Day 1-6 rebuild direction is reflected in the codebase.
- The app shell and design tokens are unified around `app-*` surfaces and typography.
- Home, `MY`, billing, results archive, and the saju result page use the new shell structure.
- The saju intake flow uses `/saju/new` as the primary service entry.
- Personal result URLs use UUID-based readings.
- Login now supports email magic-link signup/login, with phone SMS OTP left as a documented future integration.
- Push notification routes, service worker, manifest, and cron entry are in the repo.
- `SajuDataV1` now includes `orrery`-based relations, gongmang, special sals, and report evidence text.

## Verified So Far

- Vercel preview status: `Ready`
- Vercel build-time TypeScript check passed on the latest preview deployment
- Local `full tsc` passed with no output:
  - `./node_modules/.bin/tsc --noEmit --pretty false --incremental false -p tsconfig.json`
- Preview API smoke passed:
  - `GET /saju/new` -> `200`
  - `POST /api/readings` -> UUID `7a43d940-1893-4c99-92ac-f690ef753549`
  - `GET /saju/7a43d940-1893-4c99-92ac-f690ef753549` -> `200`
- Browser visual QA passed on desktop for:
  - home page
  - `/saju/new` splash/intake flow
  - generated result page `/saju/195ed6fb-0b0c-45ea-a12a-0620c537fb6a`
- Browser notification page visual QA passed in logged-out/local mode:
  - `/notifications` loaded with center, schedule, widget panels
  - browser push state showed `브라우저 미연결`
  - test send button stayed disabled until login
- Push endpoint guardrails passed on preview:
  - `GET /manifest.webmanifest` -> `200`
  - `GET /push-sw.js` -> `200`
  - `POST /api/notifications/subscribe` without login -> `401`, which implies VAPID env is present because the route checks VAPID before auth
  - `POST /api/notifications/test` without login -> `401`, which implies VAPID env is present because the route checks VAPID before auth
  - `GET /api/notifications/dispatch?dryRun=true` without secret -> `401`, which implies the cron secret gate is active
- Actual saju E2E verification passed for 3 sample cases:
  - `extensions.orrery.relations`
  - `gongmang`
  - `specialSals`
  - `report.summary`
  - `report.insights`

## Still Pending

- Run real signed-in account QA on the latest preview:
  - email magic-link signup/login
  - `/my`
  - `/my/profile`
  - `/notifications`
- Verify logged-in Supabase-backed account/profile persistence with a real session.
- Keep phone SMS OTP disabled until Supabase Auth Phone provider and an SMS provider are configured.
- If push notifications ship in this release, complete the operational setup:
  - apply `supabase/migrations/004_notifications.sql`
  - confirm VAPID env values are present in the production target, not just the preview target
  - confirm `CRON_SECRET` is present in the production target
  - redeploy after any env changes
  - verify browser subscription, manual test push, and scheduled dispatch
- Decide whether the remaining `SajuDataV1` pending sections ship now or later:
  - `tenGods`
  - `strength`
  - `pattern`
  - `yongsin`
  - `majorLuck`
  - `currentLuck`

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
  - Phone provider enabled with an SMS provider only when phone OTP is promoted from future integration to active login.
- Confirm required Supabase migrations are applied in production:
  - `001_initial.sql`
  - `002_credit_functions.sql`
  - `003_profiles.sql`
  - `004_notifications.sql`
- Confirm the push setup guide has been completed:
  - `docs/push-notifications-setup.md`
- Re-check a production reading flow after deploy:
  - `/saju/new`
  - `POST /api/readings`
  - `/saju/[uuid]`
- Re-check the notification flow after deploy:
  - `/notifications`
  - `POST /api/notifications/test`
  - `GET /api/notifications/dispatch?dryRun=true`
- Re-check `MY` routes after deploy:
  - `/my`
  - `/my/profile`
  - `/my/results`
  - `/my/billing`

## Release Sequence

1. Complete real signed-in account QA on the latest Vercel preview.
2. If notifications ship in this release, finish the setup in `docs/push-notifications-setup.md`.
3. Decide whether the remaining `SajuDataV1` pending sections are release blockers.
4. Review final `git diff` and remove or defer anything out of scope for this release.
5. Merge into `main` only after final approval.
6. Trigger or confirm the production deployment.
7. Run a final smoke test on the live domain.

## Post-Release Follow-up

- Remove or archive any remaining duplicate legacy entry points.
- Continue Day 7 with core screen rebuild refinements.
- Separate “free SEO entry” and “core paid service” metrics in analytics.
