# Push Notifications Setup

## What Was Added

- Supabase migration: `supabase/migrations/004_notifications.sql`
- Browser push service worker: `public/push-sw.js`
- Manifest: `src/app/manifest.ts`
- Notification APIs:
  - `GET/POST /api/notifications/preferences`
  - `POST /api/notifications/subscribe`
  - `POST /api/notifications/unsubscribe`
  - `POST /api/notifications/heartbeat`
  - `POST /api/notifications/test`
  - `GET/POST /api/notifications/dispatch`
- Vercel cron entry: `vercel.json`

## 1. Apply The Supabase Migration

Preferred path when the Supabase CLI is already installed and linked:

```bash
supabase db push
```

If the project is not linked yet:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Fallback path when the CLI is unavailable:

1. Open the Supabase dashboard.
2. Go to `SQL Editor`.
3. Paste the contents of `supabase/migrations/004_notifications.sql`.
4. Run the query.

## 2. Verify The New Tables

Check that these tables exist:

- `notification_preferences`
- `push_subscriptions`
- `notification_delivery_logs`

Check that RLS is enabled on all three tables.

## 3. Generate VAPID Keys

Run this once:

```bash
npm run generate:web-push-keys
```

The script prints:

- `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`
- `WEB_PUSH_PRIVATE_KEY`
- `WEB_PUSH_SUBJECT`

Use a real sender address for `WEB_PUSH_SUBJECT`, for example:

```bash
WEB_PUSH_SUBJECT=mailto:notifications@your-domain.com
```

## 4. Set Environment Variables

Add these to Vercel and any local `.env.local` you use:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`
- `WEB_PUSH_PRIVATE_KEY`
- `WEB_PUSH_SUBJECT`
- `CRON_SECRET`

You can start from `.env.example`.

## 5. Redeploy

After setting the variables, redeploy so:

- the service worker payload config is available
- `/api/notifications/test` can send real web push
- `/api/notifications/dispatch` can be called by Vercel Cron

## 6. Verify The Manual Push Flow

1. Sign in with a real account.
2. Open `/notifications`.
3. Connect browser push on one device.
4. Click the test send action.
5. Confirm a row appears in `push_subscriptions`.
6. Confirm a row appears in `notification_delivery_logs`.

## 7. Verify The Scheduled Push Flow

Dry run:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://your-domain.com/api/notifications/dispatch?dryRun=true"
```

Force a specific slot:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://your-domain.com/api/notifications/dispatch?slotKey=morning"
```

Supported slot keys:

- `morning`
- `lunch`
- `evening`
- `weekly`
- `monthly`
- `seasonal`
- `birthday`
- `returning`

## 8. Operational Notes

- Vercel Cron uses `CRON_SECRET`, so the route accepts `Authorization: Bearer <secret>`.
- The route also accepts `NOTIFICATION_CRON_SECRET` through `x-notification-secret` for manual non-Vercel calls.
- `returning` notifications are driven by `notification_preferences.last_seen_at`.
- `birthday` notifications depend on `profiles.birth_month` and `profiles.birth_day`.
- Seasonal reminders currently use fixed approximate dates, not precise solar-term calculations.
