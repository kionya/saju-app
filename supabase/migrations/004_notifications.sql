CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  style TEXT NOT NULL DEFAULT 'normal' CHECK (style IN ('quiet', 'normal', 'sound')),
  widget_size TEXT NOT NULL DEFAULT 'medium' CHECK (widget_size IN ('small', 'medium', 'large')),
  inactivity_reminder_days INT NOT NULL DEFAULT 3 CHECK (inactivity_reminder_days IN (3, 5, 7)),
  slot_preferences JSONB NOT NULL DEFAULT '{
    "morning": true,
    "lunch": true,
    "evening": true,
    "weekly": true,
    "monthly": true,
    "seasonal": true,
    "birthday": true,
    "returning": true
  }'::jsonb,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  expiration_time TIMESTAMPTZ,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  subscription_id UUID REFERENCES push_subscriptions ON DELETE SET NULL,
  slot_key TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'dismissed')),
  response_status INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 알림 설정 조회" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "본인 알림 설정 추가" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 알림 설정 수정" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "본인 푸시 구독 조회" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "본인 푸시 구독 추가" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 푸시 구독 수정" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "본인 푸시 구독 삭제" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "본인 발송 로그 조회" ON notification_delivery_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_push_subscriptions_user_active
  ON push_subscriptions (user_id, is_active, created_at DESC);

CREATE INDEX idx_notification_delivery_logs_user
  ON notification_delivery_logs (user_id, created_at DESC);
