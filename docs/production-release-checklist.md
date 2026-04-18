# Production Release Checklist

## Current Release Candidate

- Local working tree: `main`
- Preview branch pushed for verification: `codex/vercel-preview-20260419`
- Latest preview deployment:
  `https://saju-dy94akjau-kbeautys-projects.vercel.app`
- Branch alias URL:
  `https://saju-app-git-codex-vercel-preview-20260419-kbeautys-projects.vercel.app`

## Included Product Changes

- Day 1-6 rebuild direction is reflected in the codebase.
- The app shell and design tokens are unified around `app-*` surfaces and typography.
- Home, `MY`, billing, results archive, and the saju result page use the new shell structure.
- The saju intake flow uses `/saju/new` as the primary service entry.
- Personal result URLs use UUID-based readings.
- Push notification routes, service worker, manifest, and cron entry are in the repo.
- `SajuDataV1` now includes `orrery`-based relations, gongmang, special sals, and report evidence text.

## Verified So Far

- Vercel preview status: `Ready`
- Vercel build-time TypeScript check passed on the latest preview deployment
- Actual saju E2E verification passed for 3 sample cases:
  - `extensions.orrery.relations`
  - `gongmang`
  - `specialSals`
  - `report.summary`
  - `report.insights`

## Still Pending

- Re-check local `full tsc` in a clean session:
  - `./node_modules/.bin/tsc --noEmit --pretty false --incremental false -p tsconfig.json`
- Run browser QA on the latest preview for:
  - `/saju/new`
  - `/my`
  - `/my/profile`
  - `/notifications`
- Verify env-backed flows instead of preview fallbacks:
  - `POST /api/readings`
  - account dashboard/profile with real Supabase session
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
- Confirm required Supabase migrations are applied in production:
  - `001_initial.sql`
  - `002_subscriptions.sql`
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

1. Re-check `full tsc` in a clean session and record the result.
2. Run the latest Vercel preview through env-backed smoke tests.
3. If notifications ship in this release, finish the setup in `docs/push-notifications-setup.md`.
4. Decide whether the remaining `SajuDataV1` pending sections are release blockers.
5. Review `git diff` and remove or defer anything out of scope for this release.
6. Stage and commit the release candidate.
7. Push the release branch and re-check the generated preview.
8. Merge into `main` only after final approval.
9. Trigger or confirm the production deployment.
10. Run a final smoke test on the live domain.

## Post-Release Follow-up

- Remove or archive any remaining duplicate legacy entry points.
- Continue Day 7 with core screen rebuild refinements.
- Separate “free SEO entry” and “core paid service” metrics in analytics.
