-- 프로필 출생 지역과 경도 보정 설정을 저장합니다.
-- 기존 운영 DB에 이미 profiles/family_profiles가 있는 경우에도 안전하게 추가됩니다.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS birth_location_code TEXT,
  ADD COLUMN IF NOT EXISTS birth_location_label TEXT,
  ADD COLUMN IF NOT EXISTS birth_latitude DOUBLE PRECISION
    CHECK (birth_latitude IS NULL OR (birth_latitude >= -90 AND birth_latitude <= 90)),
  ADD COLUMN IF NOT EXISTS birth_longitude DOUBLE PRECISION
    CHECK (birth_longitude IS NULL OR (birth_longitude >= -180 AND birth_longitude <= 180)),
  ADD COLUMN IF NOT EXISTS solar_time_mode TEXT DEFAULT 'standard'
    CHECK (solar_time_mode IN ('standard', 'longitude'));

ALTER TABLE family_profiles
  ADD COLUMN IF NOT EXISTS birth_location_code TEXT,
  ADD COLUMN IF NOT EXISTS birth_location_label TEXT,
  ADD COLUMN IF NOT EXISTS birth_latitude DOUBLE PRECISION
    CHECK (birth_latitude IS NULL OR (birth_latitude >= -90 AND birth_latitude <= 90)),
  ADD COLUMN IF NOT EXISTS birth_longitude DOUBLE PRECISION
    CHECK (birth_longitude IS NULL OR (birth_longitude >= -180 AND birth_longitude <= 180)),
  ADD COLUMN IF NOT EXISTS solar_time_mode TEXT DEFAULT 'standard'
    CHECK (solar_time_mode IN ('standard', 'longitude'));
