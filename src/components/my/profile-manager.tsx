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
    gender: profile.gender ?? '',
    note: profile.note,
  };
}

const EMPTY_FAMILY_FORM: FamilyFormState = {
  label: '',
  relationship: RELATIONSHIP_OPTIONS[0],
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  birthHour: '',
  gender: '',
  note: '',
};

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
      setMessage('내 프로필을 저장했습니다.');
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(familyForm),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? '가족 프로필을 저장하지 못했습니다.');
        return;
      }
      setFamilyForm(EMPTY_FAMILY_FORM);
      setMessage('가족 프로필을 추가했습니다.');
      router.refresh();
    } catch {
      setMessage('가족 프로필 저장 중 네트워크 오류가 발생했습니다.');
    } finally {
      setSavingFamily(false);
    }
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
      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-white/45">내 프로필</div>
            <h2 className="mt-2 text-2xl font-semibold text-[#f8f1df]">기본 정보를 저장해두기</h2>
          </div>
          <Badge className="border-[#d2b072]/25 bg-[#d2b072]/10 text-[#f5dfaa]">
            MY 기본값
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-white/65">이름 또는 별칭</label>
            <Input
              value={profileForm.displayName}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, displayName: event.target.value }))
              }
              placeholder="예: 민지"
              className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/65">성별</label>
            <select
              value={profileForm.gender}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  gender: event.target.value as ProfileFormState['gender'],
                }))
              }
              className="w-full rounded-md border border-white/15 bg-white/6 px-3 py-2 text-sm text-white"
            >
              <option value="" className="bg-slate-950">선택 안 함</option>
              <option value="male" className="bg-slate-950">남성</option>
              <option value="female" className="bg-slate-950">여성</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3 md:col-span-2">
            <Input
              value={profileForm.birthYear}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, birthYear: event.target.value }))
              }
              placeholder="년도"
              className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
            />
            <Input
              value={profileForm.birthMonth}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, birthMonth: event.target.value }))
              }
              placeholder="월"
              className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
            />
            <Input
              value={profileForm.birthDay}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, birthDay: event.target.value }))
              }
              placeholder="일"
              className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/65">태어난 시간</label>
            <select
              value={profileForm.birthHour}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, birthHour: event.target.value }))
              }
              className="w-full rounded-md border border-white/15 bg-white/6 px-3 py-2 text-sm text-white"
            >
              {HOUR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm text-white/65">메모</label>
            <textarea
              value={profileForm.note}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, note: event.target.value }))
              }
              rows={4}
              placeholder="예: 태어난 시간은 오전으로만 기억남"
              className="w-full rounded-md border border-white/15 bg-white/6 px-3 py-2 text-sm text-white placeholder:text-white/28"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={saveProfile}
            disabled={savingProfile}
            className="rounded-full bg-[#d2b072] px-6 text-[#111827] hover:bg-[#e3c68d]"
          >
            {savingProfile ? '저장 중...' : '내 프로필 저장'}
          </Button>
          <p className="text-sm text-white/50">저장해두면 나중에 MY와 결과보관함에서 계속 이어서 쓸 수 있습니다.</p>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-white/45">가족 프로필</div>
            <h2 className="mt-2 text-2xl font-semibold text-[#f8f1df]">가족·연인·친구 프로필 추가</h2>
          </div>
          <Badge className="border-white/10 bg-white/5 text-white/62">
            재방문과 궁합 확장용
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input
            value={familyForm.label}
            onChange={(event) =>
              setFamilyForm((current) => ({ ...current, label: event.target.value }))
            }
            placeholder="이름 또는 별칭"
            className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
          />
          <select
            value={familyForm.relationship}
            onChange={(event) =>
              setFamilyForm((current) => ({ ...current, relationship: event.target.value }))
            }
            className="w-full rounded-md border border-white/15 bg-white/6 px-3 py-2 text-sm text-white"
          >
            {RELATIONSHIP_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-950">
                {option}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-3 md:col-span-2">
            <Input
              value={familyForm.birthYear}
              onChange={(event) =>
                setFamilyForm((current) => ({ ...current, birthYear: event.target.value }))
              }
              placeholder="년도"
              className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
            />
            <Input
              value={familyForm.birthMonth}
              onChange={(event) =>
                setFamilyForm((current) => ({ ...current, birthMonth: event.target.value }))
              }
              placeholder="월"
              className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
            />
            <Input
              value={familyForm.birthDay}
              onChange={(event) =>
                setFamilyForm((current) => ({ ...current, birthDay: event.target.value }))
              }
              placeholder="일"
              className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
            />
          </div>
          <div>
            <select
              value={familyForm.birthHour}
              onChange={(event) =>
                setFamilyForm((current) => ({ ...current, birthHour: event.target.value }))
              }
              className="w-full rounded-md border border-white/15 bg-white/6 px-3 py-2 text-sm text-white"
            >
              {HOUR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950">
                  {option.label}
                </option>
              ))}
            </select>
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
              className="w-full rounded-md border border-white/15 bg-white/6 px-3 py-2 text-sm text-white"
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
              className="w-full rounded-md border border-white/15 bg-white/6 px-3 py-2 text-sm text-white placeholder:text-white/28"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={saveFamilyProfile}
            disabled={savingFamily}
            className="rounded-full bg-[#d2b072] px-6 text-[#111827] hover:bg-[#e3c68d]"
          >
            {savingFamily ? '추가 중...' : '가족 프로필 추가'}
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          {initialFamilyProfiles.length > 0 ? (
            initialFamilyProfiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-[#f8f1df]">
                    {profile.label} · {profile.relationship}
                  </div>
                  <div className="mt-1 text-sm text-white/52">
                    {profile.birthYear && profile.birthMonth && profile.birthDay
                      ? `${profile.birthYear}.${profile.birthMonth}.${profile.birthDay}`
                      : '생년월일 미입력'}
                    {profile.gender ? ` · ${profile.gender === 'male' ? '남성' : '여성'}` : ''}
                  </div>
                </div>
                <Button
                  onClick={() => removeFamilyProfile(profile.id)}
                  disabled={deletingId === profile.id}
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  {deletingId === profile.id ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm leading-7 text-white/56">
              아직 가족 프로필이 없습니다. 가족이나 연인 프로필을 저장해두면 이후 궁합, 가족 리포트, 비교형 콘텐츠로 확장하기 쉬워집니다.
            </div>
          )}
        </div>

        {message && <p className="mt-4 text-sm text-[#d2b072]">{message}</p>}
      </section>
    </div>
  );
}
