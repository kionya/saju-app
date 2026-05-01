-- 코인 해금은 "이미 열린 항목인지 확인"과 "코인 차감"이 한 트랜잭션 안에서
-- 처리되어야 합니다. 같은 사용자가 같은 결과/월을 동시에 눌러도 한 번만 차감합니다.
CREATE OR REPLACE FUNCTION unlock_credit_feature_once(
  p_user_id UUID,
  p_feature TEXT,
  p_cost INT,
  p_access_metadata JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub_balance INT;
  v_balance INT;
  v_existing_id UUID;
  v_access_metadata JSONB;
BEGIN
  IF p_cost <= 0 THEN
    RETURN jsonb_build_object('success', false, 'reused', false, 'remaining', 0, 'error', '잘못된 코인 비용입니다.');
  END IF;

  v_access_metadata := COALESCE(p_access_metadata, '{}'::jsonb);

  IF NOT (v_access_metadata ? 'kind') THEN
    RETURN jsonb_build_object('success', false, 'reused', false, 'remaining', 0, 'error', '해금 기준 정보가 필요합니다.');
  END IF;

  INSERT INTO user_credits (user_id, balance, subscription_balance)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT subscription_balance, balance
  INTO v_sub_balance, v_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  SELECT id
  INTO v_existing_id
  FROM credit_transactions
  WHERE user_id = p_user_id
    AND type = 'use'
    AND feature = p_feature
    AND metadata @> v_access_metadata
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'reused', true,
      'remaining', v_sub_balance + v_balance
    );
  END IF;

  IF v_sub_balance >= p_cost THEN
    UPDATE user_credits
    SET subscription_balance = subscription_balance - p_cost,
        updated_at = now()
    WHERE user_id = p_user_id;

    INSERT INTO credit_transactions (user_id, amount, type, feature, metadata)
    VALUES (
      p_user_id,
      -p_cost,
      'use',
      p_feature,
      v_access_metadata || jsonb_build_object('charged', true, 'cost', p_cost, 'unlockMode', 'idempotent')
    );

    RETURN jsonb_build_object(
      'success', true,
      'reused', false,
      'remaining', v_sub_balance - p_cost + v_balance
    );
  END IF;

  IF v_balance >= p_cost THEN
    UPDATE user_credits
    SET balance = balance - p_cost,
        updated_at = now()
    WHERE user_id = p_user_id;

    INSERT INTO credit_transactions (user_id, amount, type, feature, metadata)
    VALUES (
      p_user_id,
      -p_cost,
      'use',
      p_feature,
      v_access_metadata || jsonb_build_object('charged', true, 'cost', p_cost, 'unlockMode', 'idempotent')
    );

    RETURN jsonb_build_object(
      'success', true,
      'reused', false,
      'remaining', v_balance - p_cost
    );
  END IF;

  RETURN jsonb_build_object(
    'success', false,
    'reused', false,
    'remaining', v_sub_balance + v_balance,
    'error', '코인이 부족합니다.'
  );
END;
$$;
