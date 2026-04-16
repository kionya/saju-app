-- 크레딧 잔액 테이블
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0,
  subscription_balance INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 크레딧 트랜잭션 이력
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount INT NOT NULL,  -- 양수=충전, 음수=차감
  type TEXT NOT NULL CHECK (type IN ('purchase', 'subscription', 'use', 'signup_bonus')),
  feature TEXT,         -- 'detail_report' | 'compat' | 'ai_chat' | 'daewoon' | 'calendar'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 구독 테이블
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  plan TEXT NOT NULL DEFAULT 'monthly',
  renews_at TIMESTAMPTZ,
  toss_billing_key TEXT,
  toss_customer_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 사주 조회 기록 (캐싱 + 히스토리)
CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  birth_year INT NOT NULL,
  birth_month INT NOT NULL,
  birth_day INT NOT NULL,
  birth_hour INT,       -- NULL이면 시주 미입력
  gender TEXT CHECK (gender IN ('male', 'female')),
  result_json JSONB NOT NULL,  -- 계산된 사주팔자 결과
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 크레딧만 조회" ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "본인 트랜잭션 조회" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "본인 구독 조회" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "본인 사주 조회" ON readings FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- 신규 가입 시 크레딧 3개 자동 지급 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance)
  VALUES (NEW.id, 3);

  INSERT INTO credit_transactions (user_id, amount, type, feature)
  VALUES (NEW.id, 3, 'signup_bonus', NULL);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 인덱스
CREATE INDEX idx_credit_transactions_user ON credit_transactions (user_id, created_at DESC);
CREATE INDEX idx_readings_user ON readings (user_id, created_at DESC);
