-- 로그인 사용자의 선생 말투 선택을 저장합니다.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_counselor TEXT
    CHECK (preferred_counselor IS NULL OR preferred_counselor IN ('male', 'female'));
