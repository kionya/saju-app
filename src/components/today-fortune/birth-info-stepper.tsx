'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HOUR_OPTIONS } from '@/features/home/content';
import { BIRTH_LOCATION_PRESETS } from '@/lib/saju/birth-location';
import type { TodayFortuneBirthPayload, TodayTimeRule } from '@/lib/today-fortune/types';

interface ProfileResponse {
  authenticated: boolean;
  profile: {
    displayName: string;
    birthYear: number | null;
    birthMonth: number | null;
    birthDay: number | null;
    birthHour: number | null;
    birthMinute: number | null;
    birthLocationCode: string | null;
    birthLocationLabel: string;
    birthLatitude: number | null;
    birthLongitude: number | null;
    solarTimeMode: 'standard' | 'longitude';
    gender: 'male' | 'female' | null;
  } | null;
}

interface BirthLocationSearchResult {
  id: string;
  label: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

interface BirthLocationSearchResponse {
  ok: boolean;
  error?: string;
  items?: BirthLocationSearchResult[];
}

interface BirthInfoStepperProps {
  draft: TodayFortuneBirthPayload;
  onChange: (patch: Partial<TodayFortuneBirthPayload>) => void;
  onStarted: () => void;
  onSubmit: () => void;
  loading: boolean;
  errorMessage: string | null;
}

const TIME_RULE_OPTIONS: Array<{
  value: TodayTimeRule;
  label: string;
  desc: string;
}> = [
  { value: 'standard', label: '표준시', desc: '기본 한국 표준시 기준' },
  { value: 'trueSolarTime', label: '진태양시', desc: '출생지 경도 보정 반영' },
  { value: 'nightZi', label: '야자시', desc: '자시를 한 흐름으로 묶어 봄' },
  { value: 'earlyZi', label: '조자시', desc: '자시 경계를 더 엄격하게 분리' },
];

function hasBirthCore(draft: TodayFortuneBirthPayload) {
  return Boolean(draft.year && draft.month && draft.day);
}

export function BirthInfoStepper({
  draft,
  onChange,
  onStarted,
  onSubmit,
  loading,
  errorMessage,
}: BirthInfoStepperProps) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [locationResults, setLocationResults] = useState<BirthLocationSearchResult[]>([]);

  async function handleLoadProfile() {
    setProfileLoading(true);
    setProfileMessage('');

    try {
      const response = await fetch('/api/profile', { cache: 'no-store' });
      const data = (await response.json().catch(() => null)) as ProfileResponse | null;

      if (!response.ok || !data?.authenticated || !data.profile?.birthYear) {
        setProfileMessage('MY 프로필에 저장된 출생 정보가 아직 충분하지 않습니다.');
        return;
      }

      onChange({
        year: String(data.profile.birthYear ?? ''),
        month: String(data.profile.birthMonth ?? ''),
        day: String(data.profile.birthDay ?? ''),
        hour: data.profile.birthHour === null ? '' : String(data.profile.birthHour),
        minute: data.profile.birthMinute === null ? '' : String(data.profile.birthMinute),
        unknownBirthTime: data.profile.birthHour === null,
        birthLocationCode: data.profile.birthLocationCode ?? '',
        birthLocationLabel: data.profile.birthLocationLabel ?? '',
        birthLatitude: data.profile.birthLatitude === null ? '' : String(data.profile.birthLatitude),
        birthLongitude: data.profile.birthLongitude === null ? '' : String(data.profile.birthLongitude),
        gender: data.profile.gender ?? '',
        timeRule:
          data.profile.solarTimeMode === 'longitude' ? 'trueSolarTime' : draft.timeRule,
      });
      setProfileMessage('MY 프로필의 출생 정보를 불러왔습니다.');
    } catch {
      setProfileMessage('MY 프로필을 불러오는 중 네트워크 오류가 있었습니다.');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleLocationSearch() {
    const query = draft.birthLocationLabel.trim();
    if (query.length < 2) {
      setLocationMessage('출생 지역을 두 글자 이상 입력해 주세요.');
      setLocationResults([]);
      return;
    }

    setLocationLoading(true);
    setLocationMessage('');
    setLocationResults([]);

    try {
      const response = await fetch(`/api/geo/birth-location?q=${encodeURIComponent(query)}`, {
        cache: 'force-cache',
      });
      const data = (await response.json().catch(() => null)) as BirthLocationSearchResponse | null;

      if (!response.ok || !data?.ok) {
        setLocationMessage(data?.error ?? '지역 좌표를 찾지 못했습니다.');
        return;
      }

      const items = data.items ?? [];
      setLocationResults(items);
      setLocationMessage(
        items.length > 0
          ? '가장 가까운 지역을 골라 위도와 경도를 적용해 주세요.'
          : '검색 결과가 없습니다. 시/군/구 이름을 조금 더 구체적으로 적어주세요.'
      );
    } catch {
      setLocationMessage('지역 좌표를 찾는 중 네트워크 오류가 있었습니다.');
    } finally {
      setLocationLoading(false);
    }
  }

  function applyPresetLocation(code: string) {
    onStarted();
    const preset = BIRTH_LOCATION_PRESETS.find((item) => item.code === code);
    if (!preset) {
      onChange({
        birthLocationCode: 'custom',
        birthLocationLabel: draft.birthLocationLabel,
      });
      return;
    }

    onChange({
      birthLocationCode: preset.code,
      birthLocationLabel: preset.label,
      birthLatitude: String(preset.latitude),
      birthLongitude: String(preset.longitude),
      timeRule: draft.timeRule === 'trueSolarTime' ? 'trueSolarTime' : draft.timeRule,
    });
  }

  const timeRuleDisabled = draft.unknownBirthTime;

  return (
    <section className="app-panel p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="app-caption">Birth Info Stepper</div>
          <h2 className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
            생년월일과 출생 정보를 넣어 오늘 흐름을 좁혀보세요
          </h2>
        </div>
        <Button
          type="button"
          onClick={handleLoadProfile}
          disabled={profileLoading}
          variant="outline"
          className="rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
        >
          {profileLoading ? '불러오는 중...' : 'MY 프로필 불러오기'}
        </Button>
      </div>

      {profileMessage ? (
        <p className="mt-3 text-sm text-[var(--app-copy-soft)]">{profileMessage}</p>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm text-[var(--app-copy)]">양력 / 음력</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'solar', label: '양력' },
                { value: 'lunar', label: '음력' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onStarted();
                    onChange({ calendarType: item.value as TodayFortuneBirthPayload['calendarType'] });
                  }}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    draft.calendarType === item.value
                      ? 'border-[var(--app-gold)]/32 bg-[var(--app-gold)]/10 text-[var(--app-ivory)]'
                      : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="today-birth-year" className="mb-2 block text-sm text-[var(--app-copy)]">년</Label>
              <Input
                id="today-birth-year"
                value={draft.year}
                onChange={(event) => {
                  onStarted();
                  onChange({ year: event.target.value });
                }}
                placeholder="1982"
              />
            </div>
            <div>
              <Label htmlFor="today-birth-month" className="mb-2 block text-sm text-[var(--app-copy)]">월</Label>
              <Input
                id="today-birth-month"
                value={draft.month}
                onChange={(event) => {
                  onStarted();
                  onChange({ month: event.target.value });
                }}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="today-birth-day" className="mb-2 block text-sm text-[var(--app-copy)]">일</Label>
              <Input
                id="today-birth-day"
                value={draft.day}
                onChange={(event) => {
                  onStarted();
                  onChange({ day: event.target.value });
                }}
                placeholder="29"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label htmlFor="today-birth-hour" className="mb-2 block text-sm text-[var(--app-copy)]">태어난 시간</Label>
              <select
                id="today-birth-hour"
                value={draft.hour}
                onChange={(event) => {
                  onStarted();
                  onChange({ hour: event.target.value, unknownBirthTime: event.target.value === '' });
                }}
                className="moon-form-control h-10 w-full rounded-lg px-3 text-sm"
              >
                {HOUR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="today-birth-minute" className="mb-2 block text-sm text-[var(--app-copy)]">분</Label>
              <Input
                id="today-birth-minute"
                value={draft.minute}
                onChange={(event) => {
                  onStarted();
                  onChange({ minute: event.target.value });
                }}
                disabled={draft.unknownBirthTime}
                placeholder="45"
              />
            </div>
            <label className="mt-8 flex items-center gap-2 text-sm text-[var(--app-copy)]">
              <input
                type="checkbox"
                checked={draft.unknownBirthTime}
                onChange={(event) => {
                  onStarted();
                  onChange({
                    unknownBirthTime: event.target.checked,
                    hour: event.target.checked ? '' : draft.hour,
                    minute: event.target.checked ? '' : draft.minute,
                  });
                }}
                className="h-4 w-4 rounded border-[var(--app-line)]"
              />
              시간 모름
            </label>
          </div>

          <div>
            <Label className="mb-2 block text-sm text-[var(--app-copy)]">성별</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'female', label: '여성' },
                { value: 'male', label: '남성' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onStarted();
                    onChange({ gender: item.value });
                  }}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    draft.gender === item.value
                      ? 'border-[var(--app-gold)]/32 bg-[var(--app-gold)]/10 text-[var(--app-ivory)]'
                      : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="today-birth-location" className="mb-2 block text-sm text-[var(--app-copy)]">
              출생지
            </Label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Input
                id="today-birth-location"
                value={draft.birthLocationLabel}
                onChange={(event) => {
                  onStarted();
                  onChange({
                    birthLocationCode: draft.birthLocationCode || 'custom',
                    birthLocationLabel: event.target.value,
                  });
                }}
                placeholder="서울, 부산, 수원처럼 입력"
              />
              <Button
                type="button"
                onClick={handleLocationSearch}
                disabled={locationLoading}
                variant="outline"
                className="rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)]"
              >
                <Search className="mr-2 h-4 w-4" />
                {locationLoading ? '검색 중...' : '좌표 찾기'}
              </Button>
            </div>
            {locationMessage ? (
              <p className="mt-2 text-xs leading-6 text-[var(--app-copy-soft)]">{locationMessage}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {BIRTH_LOCATION_PRESETS.map((preset) => (
              <button
                key={preset.code}
                type="button"
                onClick={() => applyPresetLocation(preset.code)}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  draft.birthLocationCode === preset.code
                    ? 'border-[var(--app-gold)]/30 bg-[var(--app-gold)]/10 text-[var(--app-ivory)]'
                    : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {locationResults.length > 0 ? (
            <div className="space-y-2">
              {locationResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onStarted();
                    onChange({
                      birthLocationCode: 'custom',
                      birthLocationLabel: item.label,
                      birthLatitude: String(item.latitude),
                      birthLongitude: String(item.longitude),
                    });
                    setLocationResults([]);
                    setLocationMessage(`출생지로 ${item.displayName}를 적용했습니다.`);
                  }}
                  className="block w-full rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-left text-sm text-[var(--app-copy)] transition-colors hover:border-[var(--app-gold)]/28 hover:text-[var(--app-ivory)]"
                >
                  <div className="font-medium text-[var(--app-ivory)]">{item.label}</div>
                  <div className="mt-1 text-xs leading-6 text-[var(--app-copy-soft)]">
                    {item.displayName} · 위도 {item.latitude} · 경도 {item.longitude}
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          <div>
            <Label htmlFor="today-time-rule" className="mb-2 block text-sm text-[var(--app-copy)]">
              timeRule
            </Label>
            <select
              id="today-time-rule"
              value={draft.timeRule}
              onChange={(event) => {
                onStarted();
                onChange({ timeRule: event.target.value as TodayTimeRule });
              }}
              disabled={timeRuleDisabled}
              className="moon-form-control h-10 w-full rounded-lg px-3 text-sm disabled:opacity-60"
            >
              {TIME_RULE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} · {option.desc}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-6 text-[var(--app-copy-soft)]">
              {draft.timeRule === 'trueSolarTime'
                ? '진태양시는 출생지 경도 정보가 있어야 실제로 반영됩니다.'
                : '태어난 시간이 없으면 시주 중심 해석을 줄이고 일간·월령·현재 운 중심으로 읽습니다.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--app-copy-soft)]">
          {hasBirthCore(draft)
            ? '입력이 준비되면 무료 결과를 먼저 보여드리고, 더 깊은 해석은 1코인 심화풀이로 이어집니다.'
            : '오늘의 고민에 맞춰 무료 결과를 만들려면 기본 출생 정보가 필요합니다.'}
        </p>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="h-12 rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[var(--app-bg)] hover:bg-[var(--app-gold-text)]"
        >
          {loading ? '무료 결과 만드는 중...' : '무료 결과 보기'}
        </Button>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-[1rem] border border-[var(--app-coral)]/30 bg-[rgba(248,113,113,0.08)] px-4 py-3 text-sm text-[var(--app-ivory)]">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}
