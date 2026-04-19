-- 프로필 출생 시각을 분 단위까지 저장합니다.
-- 기존 운영 DB에 이미 profiles/family_profiles가 있는 경우에도 안전하게 추가됩니다.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS birth_minute INT
    CHECK (birth_minute IS NULL OR (birth_minute >= 0 AND birth_minute <= 59));

ALTER TABLE family_profiles
  ADD COLUMN IF NOT EXISTS birth_minute INT
    CHECK (birth_minute IS NULL OR (birth_minute >= 0 AND birth_minute <= 59));
