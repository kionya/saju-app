'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HOUR_OPTIONS } from '@/features/home/content';
import { BIRTH_LOCATION_PRESETS } from '@/lib/saju/birth-location';
import type {
  UnifiedBirthEntryDraft,
  UnifiedCalendarType,
  UnifiedTimeRule,
} from '@/lib/saju/unified-birth-entry';

export interface BirthLocationSearchResultLike {
  id: string;
  label: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

const TIME_RULE_OPTIONS: Array<{
  value: UnifiedTimeRule;
  label: string;
  desc: string;
}> = [
  { value: 'standard', label: '표준시', desc: '기본 한국 표준시 기준' },
  { value: 'trueSolarTime', label: '진태양시', desc: '출생지 경도 보정 반영' },
  { value: 'nightZi', label: '야자시', desc: '자시를 한 흐름으로 묶어 봄' },
  { value: 'earlyZi', label: '조자시', desc: '자시 경계를 더 엄격하게 분리' },
];

interface UnifiedBirthInfoFieldsProps {
  draft: UnifiedBirthEntryDraft;
  onChange: (patch: Partial<UnifiedBirthEntryDraft>) => void;
  onStarted?: () => void;
  locationLoading: boolean;
  locationMessage: string;
  locationResults: BirthLocationSearchResultLike[];
  onLocationSearch: () => void;
  onPresetSelect: (code: string) => void;
  onLocationResultSelect: (result: BirthLocationSearchResultLike) => void;
}

function trigger(onStarted?: () => void) {
  onStarted?.();
}

export function UnifiedBirthInfoFields({
  draft,
  onChange,
  onStarted,
  locationLoading,
  locationMessage,
  locationResults,
  onLocationSearch,
  onPresetSelect,
  onLocationResultSelect,
}: UnifiedBirthInfoFieldsProps) {
  const timeRuleDisabled = draft.unknownBirthTime;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
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
                  trigger(onStarted);
                  onChange({ calendarType: item.value as UnifiedCalendarType });
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
            <Label htmlFor="unified-birth-year" className="mb-2 block text-sm text-[var(--app-copy)]">
              년
            </Label>
            <Input
              id="unified-birth-year"
              name="moonlight-birth-year"
              value={draft.year}
              onChange={(event) => {
                trigger(onStarted);
                onChange({ year: event.target.value });
              }}
              placeholder="1982"
              autoComplete="off"
              inputMode="numeric"
            />
          </div>
          <div>
            <Label htmlFor="unified-birth-month" className="mb-2 block text-sm text-[var(--app-copy)]">
              월
            </Label>
            <Input
              id="unified-birth-month"
              name="moonlight-birth-month"
              value={draft.month}
              onChange={(event) => {
                trigger(onStarted);
                onChange({ month: event.target.value });
              }}
              placeholder="1"
              autoComplete="off"
              inputMode="numeric"
            />
          </div>
          <div>
            <Label htmlFor="unified-birth-day" className="mb-2 block text-sm text-[var(--app-copy)]">
              일
            </Label>
            <Input
              id="unified-birth-day"
              name="moonlight-birth-day"
              value={draft.day}
              onChange={(event) => {
                trigger(onStarted);
                onChange({ day: event.target.value });
              }}
              placeholder="29"
              autoComplete="off"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <Label htmlFor="unified-birth-hour" className="mb-2 block text-sm text-[var(--app-copy)]">
              태어난 시간
            </Label>
            <select
              id="unified-birth-hour"
              name="moonlight-birth-hour"
              value={draft.hour}
              onChange={(event) => {
                trigger(onStarted);
                onChange({
                  hour: event.target.value,
                  unknownBirthTime: event.target.value === '',
                });
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
            <Label htmlFor="unified-birth-minute" className="mb-2 block text-sm text-[var(--app-copy)]">
              분
            </Label>
            <Input
              id="unified-birth-minute"
              name="moonlight-birth-minute"
              value={draft.minute}
              onChange={(event) => {
                trigger(onStarted);
                onChange({ minute: event.target.value });
              }}
              disabled={draft.unknownBirthTime}
              placeholder="45"
              autoComplete="off"
              inputMode="numeric"
            />
          </div>
          <label className="mt-8 flex items-center gap-2 text-sm text-[var(--app-copy)]">
            <input
              type="checkbox"
              checked={draft.unknownBirthTime}
              onChange={(event) => {
                trigger(onStarted);
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
                  trigger(onStarted);
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
          <Label htmlFor="unified-birth-location" className="mb-2 block text-sm text-[var(--app-copy)]">
            출생지
          </Label>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              id="unified-birth-location"
              name="moonlight-birth-location"
              value={draft.birthLocationLabel}
              onChange={(event) => {
                trigger(onStarted);
                onChange({
                  birthLocationCode: draft.birthLocationCode || 'custom',
                  birthLocationLabel: event.target.value,
                });
              }}
              placeholder="서울, 부산, 수원처럼 입력"
              autoComplete="off"
            />
            <Button
              type="button"
              onClick={onLocationSearch}
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
              onClick={() => {
                trigger(onStarted);
                onPresetSelect(preset.code);
              }}
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
                  trigger(onStarted);
                  onLocationResultSelect(item);
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
          <Label htmlFor="unified-time-rule" className="mb-2 block text-sm text-[var(--app-copy)]">
            timeRule
          </Label>
          <select
            id="unified-time-rule"
            name="moonlight-time-rule"
            value={draft.timeRule}
            onChange={(event) => {
              trigger(onStarted);
              onChange({ timeRule: event.target.value as UnifiedTimeRule });
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
  );
}
