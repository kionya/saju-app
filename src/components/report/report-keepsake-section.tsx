import Link from 'next/link';
import { Archive, FileText, MessageCircleMore, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReportKeepsakeAction = {
  label: string;
  href?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'muted';
};

type ReportKeepsakeSectionProps = {
  className?: string;
  title?: string;
  description?: string;
  pdfHref?: string | null;
  resultsHref?: string;
  dialogueHref?: string;
  updatesHref?: string;
  actions?: ReportKeepsakeAction[];
};

const DEFAULT_TITLE = '한 번 보고 사라지지 않도록 보관합니다';
const DEFAULT_DESCRIPTION =
  '명식, 격국, 용신, 대운의 기준은 시간이 지나도 다시 확인할 수 있어야 합니다. 달빛선생 리포트는 PDF와 MY 보관함, 대화 상담으로 이어집니다.';

function actionClassName(variant: ReportKeepsakeAction['variant']) {
  switch (variant) {
    case 'primary':
      return 'inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]';
    case 'secondary':
      return 'inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18';
    default:
      return 'inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]';
  }
}

export function ReportKeepsakeSection({
  className,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  pdfHref = null,
  resultsHref = '/my/results',
  dialogueHref = '/dialogue',
  updatesHref = '/saju/new?product=yearly-2026',
  actions,
}: ReportKeepsakeSectionProps) {
  const items = [
    {
      title: 'PDF 다운로드',
      body: '표지, 목차, 요약, 본문, 판정 근거를 한 편의 리포트로 정리합니다.',
      href: pdfHref,
      ctaLabel: pdfHref ? 'PDF 열기' : '준비 중',
      icon: FileText,
      statusTone: pdfHref
        ? 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]'
        : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-soft)]',
    },
    {
      title: 'MY 보관함',
      body: '다시 읽고 싶은 해석을 저장하고, 가족·궁합 리포트와 이어볼 수 있습니다.',
      href: resultsHref,
      ctaLabel: '보관함 보기',
      icon: Archive,
      statusTone: 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]',
    },
    {
      title: '대화 연결',
      body: '리포트 기준 위에서 달빛선생에게 이어서 질문할 수 있습니다.',
      href: dialogueHref,
      ctaLabel: '대화 이어보기',
      icon: MessageCircleMore,
      statusTone: 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]',
    },
    {
      title: '업데이트',
      body: '연간·월간 흐름은 같은 명리 기준 위에서 다시 정리됩니다.',
      href: updatesHref,
      ctaLabel: '흐름 다시 보기',
      icon: RefreshCw,
      statusTone: 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]',
    },
  ] as const;

  return (
    <section className={cn('app-panel p-6 sm:p-7', className)}>
      <div className="app-caption">리포트 소장 가치</div>
      <h2 className="mt-3 font-display text-3xl text-[var(--app-ivory)]">{title}</h2>
      <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{description}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-[20px] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-gold)]/20 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
                  <Icon className="h-4 w-4" />
                </div>
                <span className={cn('rounded-full border px-2.5 py-1 text-[11px]', item.statusTone)}>
                  {item.ctaLabel}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl text-[var(--app-ivory)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
              <div className="mt-4">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                  >
                    {item.ctaLabel}
                  </Link>
                ) : (
                  <span className="text-sm text-[var(--app-copy-soft)]">{item.ctaLabel}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {actions && actions.length > 0 ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {actions.map((action) =>
            action.href && !action.disabled ? (
              <Link key={action.label} href={action.href} className={actionClassName(action.variant)}>
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                disabled
                aria-disabled="true"
                className={cn(
                  actionClassName(action.variant),
                  'cursor-not-allowed opacity-70 hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-copy)]'
                )}
              >
                {action.label}
              </button>
            )
          )}
        </div>
      ) : null}
    </section>
  );
}
