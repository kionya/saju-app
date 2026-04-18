# Production Release Checklist

## Current Release Candidate

- Branch: `codex/production-prep`
- Verified local build: `npm run build`
- Verified preview deployment: `https://saju-30eo6aylj-kbeautys-projects.vercel.app`
- Share URL for protected preview:
  `https://saju-30eo6aylj-kbeautys-projects.vercel.app/?_vercel_share=FVObHHQ21widEv4dZC9n1yjHfToE6EWY`
- Share URL expiry: `2026-04-18 08:50 KST`

## Included Product Changes

- Day 1-6 rebuild direction is reflected in the codebase.
- The app shell and design tokens are unified around `app-*` surfaces and typography.
- Home, `MY`, billing, results archive, and the saju result page use the new shell structure.
- The saju intake flow uses `/saju/new` as the primary service entry.
- Personal result URLs use UUID-based readings.
- Preview QA covered both desktop and mobile layouts on the deployed preview.

## Verified Before Production

- `npx tsc --noEmit`
- `npm run build`
- Vercel preview status: `Ready`
- Browser QA on preview home page
- Browser QA on preview result page
- Browser QA on mobile viewport `390x844`
- Browser console errors: none observed on checked pages

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

1. Review `git diff` on `codex/production-prep`.
2. Stage and commit the release candidate.
3. Push `codex/production-prep`.
4. Re-check the preview deployment generated from the pushed branch.
5. Merge into `main` only after final approval.
6. Trigger or confirm the production deployment.
7. Run a final smoke test on the live domain.

## Post-Release Follow-up

- Remove or archive any remaining duplicate legacy entry points.
- Continue Day 7 with core screen rebuild refinements.
- Separate “free SEO entry” and “core paid service” metrics in analytics.
