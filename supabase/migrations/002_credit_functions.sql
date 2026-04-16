-- 크레딧 차감 함수 (원자적)
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_cost INT,
  p_feature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub_balance INT;
  v_balance INT;
  v_remaining INT;
BEGIN
  SELECT subscription_balance, balance
  INTO v_sub_balance, v_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 구독 크레딧 먼저 차감
  IF v_sub_balance >= p_cost THEN
    UPDATE user_credits
    SET subscription_balance = subscription_balance - p_cost,
        updated_at = now()
    WHERE user_id = p_user_id;

    INSERT INTO credit_transactions (user_id, amount, type, feature)
    VALUES (p_user_id, -p_cost, 'use', p_feature);

    RETURN jsonb_build_object('success', true, 'remaining', v_sub_balance - p_cost + v_balance);

  ELSIF v_balance >= p_cost THEN
    UPDATE user_credits
    SET balance = balance - p_cost,
        updated_at = now()
    WHERE user_id = p_user_id;

    INSERT INTO credit_transactions (user_id, amount, type, feature)
    VALUES (p_user_id, -p_cost, 'use', p_feature);

    RETURN jsonb_build_object('success', true, 'remaining', v_balance - p_cost);

  ELSE
    RETURN jsonb_build_object('success', false, 'remaining', v_balance + v_sub_balance);
  END IF;
END;
$$;

-- 크레딧 충전 함수
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INT,
  p_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance, subscription_balance)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  IF p_type = 'subscription' THEN
    UPDATE user_credits
    SET subscription_balance = subscription_balance + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE user_credits
    SET balance = balance + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  INSERT INTO credit_transactions (user_id, amount, type, metadata)
  VALUES (p_user_id, p_amount, p_type, p_metadata);
END;
$$;