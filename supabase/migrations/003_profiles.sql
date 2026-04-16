-- 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  birth_year INT,
  birth_month INT,
  birth_day INT,
  birth_hour INT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 가족 프로필 테이블
CREATE TABLE IF NOT EXISTS family_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  label TEXT NOT NULL,
  relationship TEXT NOT NULL,
  birth_year INT,
  birth_month INT,
  birth_day INT,
  birth_hour INT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 프로필 조회" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "본인 프로필 추가" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 프로필 수정" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "본인 가족 프로필 조회" ON family_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "본인 가족 프로필 추가" ON family_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 가족 프로필 수정" ON family_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "본인 가족 프로필 삭제" ON family_profiles
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_family_profiles_user ON family_profiles (user_id, created_at DESC);
