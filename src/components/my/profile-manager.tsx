'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HOUR_OPTIONS } from '@/lib/home-content';
import type { FamilyProfile, UserProfile } from '@/lib/profile';

const RELATIONSHIP_OPTIONS = [
  '배우자',
  '연인',
  '부모',
  '자녀',
  '형제자매',
  '친구',
  '동료',
  '기타',
] as const;

interface ProfileManagerProps {
  initialProfile: UserProfile;
  initialFamilyProfiles: FamilyProfile[];
}

type ProfileFormState = {
  displayName: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  gender: '' | 'male' | 'female';
  note: string;
};

type FamilyFormState = {
  label: string;
  relationship: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  gender: '' | 'male' | 'female';
  note: string;
};

function toProfileFormState(profile: UserProfile): ProfileFormState {
  return {
    displayName: profile.displayName,
    birthYear: profile.birthYear ? String(profile.birthYear) : '',
    birthMonth: profile.birthMonth ? String(profile.birthMonth) : '',
    birthDay: profile.birthDay ? String(profile.birthDay) : '',
    birthHour: profile.birthHour === null ? '' : String(profile.birthHour),
    birthMinute: profile.birthMinute === null ? '' : String(profile.birthMinute),
    gender: profile.gender ?? '',
    note: profile.note,
  };
}

function toFamilyFormState(profile: FamilyProfile): FamilyFormState {
  return {
    label: profile.label,
    relationship: profile.relationship,
    birthYear: profile.birthYear ? String(profile.birthYear) : '',
    birthMonth: profile.birthMonth ? String(profile.birthMonth) : '',
    birthDay: profile.birthDay ? String(profile.birthDay) : '',
    birthHour: profile.birthHour === null ? '' : String(profile.birthHour),
    birthMinute: profile.birthMinute === null ? '' : String(profile.birthMinute),
    gender: profile.gender ?? '',
    note: profile.note,
  };
}

function formatBirthSummary(profile: {
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthHour: number | null;
  birthMinute: number | null;
}) {
  if (!profile.birthYear || !profile.birthMonth || !profile.birthDay) {
    return '생년월일 미입력';
  }

  if (profile.birthHour === null) {
    return `${profile.birthYear}.${profile.birthMonth}.${profile.birthDay} · 시간 미입력`;
  }

  const minuteLabel =
    profile.birthMinute === null
      ? ''
      : ` ${String(profile.birthMinute).padStart(2, '0')}분`;

  return `${profile.birthYear}.${profile.birthMonth}.${profile.birthDay} · ${profile.birthHour}시${minuteLabel}`;
}

const EMPTY_FAMILY_FORM: FamilyFormState = {
  label: '',
  relationship: RELATIONSHIP_OPTIONS[0],
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  birthHour: '',
  birthMinute: '',
  gender: '',
  note: '',
};

const FIELD_LABEL_CLASS = 'mb-1.5 block text-sm text-[var(--app-copy-muted)]';
const FORM_CONTROL_CLASS = 'moon-form-control px-3 py-2 text-sm';
const SELECT_CONTROL_CLASS = `${FORM_CONTROL_CLASS} appearance-none`;
const TEXTAREA_CONTROL_CLASS = `${FORM_CONTROL_CLASS} leading-7`;

export default function ProfileManager({
  initialProfile,
  initialFamilyProfiles,
}: ProfileManagerProps) {
  const router = useRouter();
  const [profileForm, setProfileForm] = useState<ProfileFormState>(
    toProfileFormState(initialProfile)
  );
  const [familyForm, setFamilyForm] = useState<FamilyFormState>(EMPTY_FAMILY_FORM);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingFamily, setSavingFamily] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function saveProfile() {
    setSavingProfile(true);
    setMessage('');
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? '프로필을 저장하지 못했습니다.');
        return;
      }
      setMessage('내 프로필을 저장했습니다. 같은 버튼으로 기존 정보도 계속 수정됩니다.');
      router.refresh();
    } catch {
      setMessage('프로필 저장 중 네트워크 오류가 발생했습니다.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveFamilyProfile() {
    setSavingFamily(true);
    setMessage('');
    try {
      const response = await fetch('/api/family-profiles', {
        method: editingFamilyId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFamilyId ? { id: editingFamilyId, ...familyForm } : familyForm),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? '가족 프로필을 저장하지 못했습니다.');
        return;
      }
      setFamilyForm(EMPTY_FAMILY_FORM);
      setEditingFamilyId(null);
      setMessage(editingFamilyId ? '가족 프로필을 수정했습니다.' : '가족 프로필을 추가했습니다.');
      router.refresh();
    } catch {
      setMessage('가족 프로필 저장 중 네트워크 오류가 발생했습니다.');
    } finally {
      setSavingFamily(false);
    }
  }

  function editFamilyProfile(profile: FamilyProfile) {
    setEditingFamilyId(profile.id);
    setFamilyForm(toFamilyFormState(profile));
    setMessage(`${profile.label} 프로필을 수정 중입니다. 저장하면 기존 정보가 바뀝니다.`);
  }

  function cancelFamilyEdit() {
    setEditingFamilyId(null);
    setFamilyForm(EMPTY_FAMILY_FORM);
    setMessage('');
  }

  async function removeFamilyProfile(id: string) {
    setDeletingId(id);
    setMessage('');
    try {
      const response = await fetch('/api/family-profiles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? '가족 프로필을 삭제하지 못했습니다.');
        return;
      }
      if (editingFamilyId === id) {
        setEditingFamilyId(null);
        setFamilyForm(EMPTY_FAMILY_FORM);
      }
      setMessage('가족 프로필을 삭제했습니다.');
      router.refresh();
    } catch {
      setMessage('가족 프로필 삭제 중 네트워크 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="moon-lunar-panel p-6">
        <div className="app-starfield" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="app-caption">내 프로필</div>
            <h2 className="mt-2 font-[var(--font-heading)] text-2xl font-semibold text-[var(--app-ivory)]">
              기본 정보를 저장/수정하기
            </h2>
          </div>
          <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
            MY 기본값 업데이트
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className={FIELD_LABEL_CLASS}>이름 또는 별칭</label>
            <Input
              value={profileForm.displayName}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, displayName: event.target.value }))
              }
              placeholder="예: 민지"
              className={FORM_CONTROL_CLASS}
            />
          </div>
          <div>
            <label className={FIELD_LABEL_CLASS}>성별</label>
            <select
              value={profileForm.gender}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  gender: event.target.value as ProfileFormState['gender'],
                }))
              }
              className={SELECT_CONTROL_CLASS}
            >
              <option value="" className="bg-slate-950">선택 안 함</option>
              <option value="male" className="bg-slate-950">남성</option>
              <option value="female" className="bg-slate-950">여성</option>
            </select>
          </div>
          <div className="moon-orbit-card p-4 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-sm font-medium text-[var(--app-ivory)]">생년월일과 태어난 시간</label>
              <span className="text-xs text-[var(--app-gold-text)]">불러오기 자동 입력 기준</span>
            </div>
            <p className="mt-2 text-xs leading-6 text-[var(--app-copy-muted)]">
              시와 분을 저장해두면 사주 입력 화면의 “내 정보 불러오기”에서 정확한 출생 시각까지 함께 채워집니다.
              저장 버튼은 새로 만들기가 아니라 현재 내 정보를 계속 업데이트합니다.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-5">
              <Input
                value={profileForm.birthYear}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, birthYear: event.target.value }))
                }
                placeholder="년도"
                aria-label="출생년도"
                className={FORM_CONTROL_CLASS}
              />
              <Input
                value={profileForm.birthMonth}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, birthMonth: event.target.value }))
                }
                placeholder="월"
                aria-label="출생월"
                className={FORM_CONTROL_CLASS}
              />
              <Input
                value={profileForm.birthDay}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, birthDay: event.target.value }))
                }
                placeholder="일"
                aria-label="출생일"
                className={FORM_CONTROL_CLASS}
              />
              <select
                value={profileForm.birthHour}
                aria-label="태어난 시간"
                onChange={(event) => {
                  const birthHour = event.target.value;
                  setProfileForm((current) => ({
                    ...current,
                    birthHour,
                    birthMinute: birthHour ? current.birthMinute : '',
                  }));
                }}
                className={SELECT_CONTROL_CLASS}
              >
                {HOUR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-950">
                    {option.label}
                  </option>
                ))}
              </select>
              <Input
                value={profileForm.birthMinute}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    birthMinute: event.target.value,
                  }))
                }
                placeholder="분"
                aria-label="태어난 분"
                inputMode="numeric"
                min={0}
                max={59}
                type="number"
                disabled={!profileForm.birthHour}
                className={FORM_CONTROL_CLASS}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={FIELD_LABEL_CLASS}>메모</label>
            <textarea
              value={profileForm.note}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, note: event.target.value }))
              }
              rows={4}
              placeholder="예: 태어난 시간은 오전으로만 기억남"
              className={TEXTAREA_CONTROL_CLASS}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={saveProfile}
            disabled={savingProfile}
            className="rounded-full bg-[var(--app-gold)] px-6 text-[var(--app-bg)] hover:bg-[var(--app-gold-bright)]"
          >
            {savingProfile ? '저장 중...' : '내 프로필 저장/수정'}
          </Button>
          <p className="text-sm text-[var(--app-copy-muted)]">동일 계정의 기존 내 정보가 있으면 이 값으로 덮어써집니다.</p>
        </div>
      </section>

      <section className="app-panel p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="app-caption">가족 프로필</div>
            <h2 className="mt-2 font-[var(--font-heading)] text-2xl font-semibold text-[var(--app-ivory)]">
              {editingFamilyId ? '가족·연인·친구 프로필 수정' : '가족·연인·친구 프로필 추가'}
            </h2>
          </div>
          <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
            {editingFamilyId ? '수정 모드' : '재방문과 궁합 확장용'}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input
            value={familyForm.label}
            onChange={(event) =>
              setFamilyForm((current) => ({ ...current, label: event.target.value }))
            }
            placeholder="이름 또는 별칭"
            className={FORM_CONTROL_CLASS}
          />
          <select
            value={familyForm.relationship}
            onChange={(event) =>
              setFamilyForm((current) => ({ ...current, relationship: event.target.value }))
            }
            className={SELECT_CONTROL_CLASS}
          >
            {RELATIONSHIP_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-950">
                {option}
              </option>
            ))}
          </select>
          <div className="moon-orbit-card p-4 md:col-span-2">
            <label className="block text-sm font-medium text-[var(--app-ivory)]">생년월일과 태어난 시간</label>
            <p className="mt-2 text-xs leading-6 text-[var(--app-copy-muted)]">
              가족 프로필도 시와 분까지 저장됩니다. “수정”을 누르면 아래 입력칸에 기존 값이 들어오고, 저장 시 그 프로필이 업데이트됩니다.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-5">
              <Input
                value={familyForm.birthYear}
                onChange={(event) =>
                  setFamilyForm((current) => ({ ...current, birthYear: event.target.value }))
                }
                placeholder="년도"
                aria-label="가족 출생년도"
                className={FORM_CONTROL_CLASS}
              />
              <Input
                value={familyForm.birthMonth}
                onChange={(event) =>
                  setFamilyForm((current) => ({ ...current, birthMonth: event.target.value }))
                }
                placeholder="월"
                aria-label="가족 출생월"
                className={FORM_CONTROL_CLASS}
              />
              <Input
                value={familyForm.birthDay}
                onChange={(event) =>
                  setFamilyForm((current) => ({ ...current, birthDay: event.target.value }))
                }
                placeholder="일"
                aria-label="가족 출생일"
                className={FORM_CONTROL_CLASS}
              />
              <select
                value={familyForm.birthHour}
                aria-label="가족 태어난 시간"
                onChange={(event) => {
                  const birthHour = event.target.value;
                  setFamilyForm((current) => ({
                    ...current,
                    birthHour,
                    birthMinute: birthHour ? current.birthMinute : '',
                  }));
                }}
                className={SELECT_CONTROL_CLASS}
              >
                {HOUR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-950">
                    {option.label}
                  </option>
                ))}
              </select>
              <Input
                value={familyForm.birthMinute}
                onChange={(event) =>
                  setFamilyForm((current) => ({
                    ...current,
                    birthMinute: event.target.value,
                  }))
                }
                placeholder="분"
                aria-label="가족 태어난 분"
                inputMode="numeric"
                min={0}
                max={59}
                type="number"
                disabled={!familyForm.birthHour}
                className={FORM_CONTROL_CLASS}
              />
            </div>
          </div>
          <div>
            <select
              value={familyForm.gender}
              onChange={(event) =>
                setFamilyForm((current) => ({
                  ...current,
                  gender: event.target.value as FamilyFormState['gender'],
                }))
              }
              className={SELECT_CONTROL_CLASS}
            >
              <option value="" className="bg-slate-950">성별 선택 안 함</option>
              <option value="male" className="bg-slate-950">남성</option>
              <option value="female" className="bg-slate-950">여성</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <textarea
              value={familyForm.note}
              onChange={(event) =>
                setFamilyForm((current) => ({ ...current, note: event.target.value }))
              }
              rows={4}
              placeholder="예: 엄마, 음력 생일만 기억남"
              className={TEXTAREA_CONTROL_CLASS}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={saveFamilyProfile}
            disabled={savingFamily}
            className="rounded-full bg-[var(--app-gold)] px-6 text-[var(--app-bg)] hover:bg-[var(--app-gold-bright)]"
          >
            {savingFamily
              ? editingFamilyId
                ? '수정 중...'
                : '추가 중...'
              : editingFamilyId
                ? '가족 프로필 수정 저장'
                : '가족 프로필 추가'}
          </Button>
          {editingFamilyId ? (
            <Button
              onClick={cancelFamilyEdit}
              disabled={savingFamily}
              variant="outline"
              className="rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
            >
              수정 취소
            </Button>
          ) : null}
        </div>

        <div className="mt-8 space-y-3">
          {initialFamilyProfiles.length > 0 ? (
            initialFamilyProfiles.map((profile) => (
              <div
                key={profile.id}
                className="moon-account-row flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-[var(--app-ivory)]">
                    {profile.label} · {profile.relationship}
                  </div>
                  <div className="mt-1 text-sm text-[var(--app-copy-muted)]">
                    {formatBirthSummary(profile)}
                    {profile.gender ? ` · ${profile.gender === 'male' ? '남성' : '여성'}` : ''}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => editFamilyProfile(profile)}
                    disabled={savingFamily || deletingId === profile.id}
                    variant="outline"
                    className="rounded-full border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)] hover:bg-[var(--app-gold)]/15 hover:text-[var(--app-gold-text)]"
                  >
                    수정
                  </Button>
                  <Button
                    onClick={() => removeFamilyProfile(profile.id)}
                    disabled={deletingId === profile.id}
                    variant="outline"
                    className="rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                  >
                    {deletingId === profile.id ? '삭제 중...' : '삭제'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--app-line)] bg-[var(--app-surface-muted)] p-6 text-sm leading-7 text-[var(--app-copy-muted)]">
              아직 가족 프로필이 없습니다. 가족이나 연인 프로필을 저장해두면 이후 궁합, 가족 리포트, 비교형 콘텐츠로 확장하기 쉬워집니다.
            </div>
          )}
        </div>

        {message && <p className="mt-4 text-sm text-[var(--app-gold-text)]">{message}</p>}
      </section>
    </div>
  );
}
