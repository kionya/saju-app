import { NextRequest, NextResponse } from 'next/server';
import {
  NOTIFICATION_SCHEDULE_BLUEPRINT,
  type NotificationSlotKey,
} from '@/content/moonlight';
import {
  createNotificationDeliveryLog,
  listNotificationRecipients,
  markPushDeliveryResult,
} from '@/lib/notification-preferences';
import {
  buildPushPayload,
  isWebPushConfigured,
  personalizeNotificationBody,
  sendWebPushNotification,
} from '@/lib/web-push';

function resolveDueSlotKeys(now: Date) {
  const day = now.getDay();
  const date = now.getDate();
  const month = now.getMonth() + 1;
  const hour = now.getHours();
  const due = new Set<NotificationSlotKey>();

  if (hour === 7) due.add('morning');
  if (hour === 12) due.add('lunch');
  if (hour === 10) due.add('returning');
  if (hour === 20) due.add('evening');
  if (day === 1 && hour === 9) due.add('weekly');
  if (date === 1 && hour === 8) due.add('monthly');
  if (hour === 8) due.add('birthday');

  const seasonalDates = new Set(['2-4', '5-5', '8-7', '11-7']);
  if (seasonalDates.has(`${month}-${date}`) && hour === 8) due.add('seasonal');

  return [...due];
}

function isReturningDue(lastSeenAt: string | null, thresholdDays: 3 | 5 | 7, now: Date) {
  if (!lastSeenAt) return false;

  const diffMs = now.getTime() - new Date(lastSeenAt).getTime();
  return diffMs >= thresholdDays * 24 * 60 * 60 * 1000;
}

function getSlotBlueprint(slotKey: NotificationSlotKey) {
  return (
    NOTIFICATION_SCHEDULE_BLUEPRINT.find((slot) => slot.key === slotKey) ??
    NOTIFICATION_SCHEDULE_BLUEPRINT[0]
  );
}

function isAuthorized(req: NextRequest) {
  const secret =
    process.env.NOTIFICATION_CRON_SECRET ?? process.env.CRON_SECRET ?? null;

  if (!secret) return true;

  const authorization = req.headers.get('authorization');
  const headerSecret = req.headers.get('x-notification-secret');

  return authorization === `Bearer ${secret}` || headerSecret === secret;
}

async function handleDispatch(
  req: NextRequest,
  body?: { slotKey?: NotificationSlotKey; dryRun?: boolean } | null
) {
  if (!isWebPushConfigured()) {
    return NextResponse.json(
      { error: '웹 푸시 VAPID 환경변수가 아직 설정되지 않았습니다.' },
      { status: 503 }
    );
  }

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: '허용되지 않은 요청입니다.' }, { status: 401 });
  }

  const now = new Date();
  const forcedSlot = body?.slotKey;
  const dueSlots = forcedSlot ? [forcedSlot] : resolveDueSlotKeys(now);
  const recipients = await listNotificationRecipients();

  const results: Array<{
    userId: string;
    slotKey: NotificationSlotKey;
    sent: number;
  }> = [];

  for (const recipient of recipients) {
    if (!recipient.preferences.enabled || recipient.subscriptions.length === 0) {
      continue;
    }

    const activeSlots = dueSlots.filter((slotKey) => {
      if (!recipient.preferences.slots[slotKey]) return false;
      if (
        slotKey === 'birthday' &&
        (recipient.birthMonth !== now.getMonth() + 1 || recipient.birthDay !== now.getDate())
      ) {
        return false;
      }
      if (slotKey !== 'returning') return true;
      return isReturningDue(
        recipient.preferences.lastSeenAt,
        recipient.preferences.inactivityReminderDays,
        now
      );
    });

    for (const slotKey of activeSlots) {
      const blueprint = getSlotBlueprint(slotKey);
      const payload = buildPushPayload({
        slotKey,
        title: blueprint.title,
        body: personalizeNotificationBody(
          blueprint.body,
          recipient.displayName || '선생님'
        ),
        url: '/notifications',
      });

      if (body?.dryRun) {
        results.push({
          userId: recipient.userId,
          slotKey,
          sent: recipient.subscriptions.length,
        });
        continue;
      }

      let sent = 0;

      for (const subscription of recipient.subscriptions) {
        try {
          const response = await sendWebPushNotification(subscription, payload);
          sent += 1;

          await Promise.all([
            markPushDeliveryResult({
              subscriptionId: subscription.id,
              endpoint: subscription.endpoint,
              success: true,
              statusCode: response.statusCode,
            }),
            createNotificationDeliveryLog({
              userId: recipient.userId,
              subscriptionId: subscription.id,
              slotKey,
              title: payload.title,
              body: payload.body,
              status: 'sent',
              responseStatus: response.statusCode,
            }),
          ]);
        } catch (error) {
          const statusCode =
            error && typeof error === 'object' && 'statusCode' in error
              ? Number((error as { statusCode?: unknown }).statusCode ?? 0) || undefined
              : undefined;
          const failureReason =
            error instanceof Error ? error.message : '웹 푸시 발송에 실패했습니다.';

          await Promise.all([
            markPushDeliveryResult({
              subscriptionId: subscription.id,
              endpoint: subscription.endpoint,
              success: false,
              statusCode,
              failureReason,
            }),
            createNotificationDeliveryLog({
              userId: recipient.userId,
              subscriptionId: subscription.id,
              slotKey,
              title: payload.title,
              body: payload.body,
              status: 'failed',
              responseStatus: statusCode,
            }),
          ]);
        }
      }

      results.push({
        userId: recipient.userId,
        slotKey,
        sent,
      });
    }
  }

  return NextResponse.json({
    success: true,
    dryRun: Boolean(body?.dryRun),
    dueSlots,
    results,
  });
}

export async function GET(req: NextRequest) {
  const slotKey = req.nextUrl.searchParams.get('slotKey');
  const dryRun = req.nextUrl.searchParams.get('dryRun') === 'true';

  return handleDispatch(req, {
    slotKey:
      slotKey &&
      NOTIFICATION_SCHEDULE_BLUEPRINT.some((slot) => slot.key === slotKey)
        ? (slotKey as NotificationSlotKey)
        : undefined,
    dryRun,
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { slotKey?: NotificationSlotKey; dryRun?: boolean }
    | null;

  return handleDispatch(req, body);
}
