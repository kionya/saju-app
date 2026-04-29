'use client';

import {
  AlertCircle,
  Gavel,
  HeartPulse,
  Landmark,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type SafetyNoticeVariant =
  | 'general'
  | 'health'
  | 'finance'
  | 'legal'
  | 'crisis';

type VariantConfig = {
  icon: LucideIcon;
  title: string;
  body: string;
  tone: string;
};

const COMMON_COPY =
  '달빛선생의 해석은 삶의 흐름을 참고하기 위한 구조 해석입니다. 의료·법률·투자·위기상황 판단은 전문 기준과 도움을 우선해 주세요.';

const VARIANT_CONFIG: Record<SafetyNoticeVariant, VariantConfig> = {
  general: {
    icon: AlertCircle,
    title: '해석은 참고 흐름으로만 보셔도 충분합니다',
    body: '결과를 단정이나 예언처럼 받아들이기보다, 지금 삶의 리듬을 정리하는 참고 기준으로 읽어주시면 가장 자연스럽습니다.',
    tone: 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)]',
  },
  health: {
    icon: HeartPulse,
    title: '건강 해석은 생활 리듬 관리 관점에서만 읽습니다',
    body: '몸 상태와 치료 판단은 사주 해석으로 대신하지 않습니다. 컨디션, 휴식, 생활 리듬을 돌아보는 참고 흐름으로만 받아들여 주세요.',
    tone: 'border-[var(--app-coral)]/25 bg-[var(--app-coral)]/10 text-[var(--app-copy)]',
  },
  finance: {
    icon: TrendingUp,
    title: '투자 판단은 별도 전문 기준이 필요한 영역입니다',
    body: '재물운 해석은 지출 관리와 선택 리듬을 돌아보는 참고용입니다. 투자·매수·매도 판단은 별도의 전문 기준을 우선해 주세요.',
    tone: 'border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-copy)]',
  },
  legal: {
    icon: Gavel,
    title: '법률 판단은 전문가 상담이 필요한 영역입니다',
    body: '갈등과 관계 흐름은 읽어드릴 수 있지만, 법적 책임이나 소송 결과는 사주로 단정하지 않습니다. 필요한 경우 전문가 상담이 먼저입니다.',
    tone: 'border-[var(--app-sky)]/25 bg-[var(--app-sky)]/10 text-[var(--app-copy)]',
  },
  crisis: {
    icon: Landmark,
    title: '위기상황은 사주 해석보다 즉각적인 도움 연결이 우선입니다',
    body: '지금 안전이 먼저인 상황이라면 해석보다 주변의 믿을 수 있는 사람, 긴급 지원, 전문 기관과의 연결을 우선해 주세요.',
    tone: 'border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 text-[var(--app-copy)]',
  },
};

type SafetyNoticeProps = {
  variant?: SafetyNoticeVariant;
  className?: string;
};

export function SafetyNotice({
  variant = 'general',
  className,
}: SafetyNoticeProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <section
      className={cn(
        'rounded-[1.5rem] border px-5 py-5 sm:px-6 sm:py-6',
        config.tone,
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.08)] text-[var(--app-gold-text)]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="app-caption">안전한 해석 안내</div>
          <h3 className="mt-2 font-display text-2xl leading-tight text-[var(--app-ivory)]">
            {config.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
            {COMMON_COPY}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
            {config.body}
          </p>
        </div>
      </div>
    </section>
  );
}
