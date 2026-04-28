import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SPECIALIST_MENTORS } from '@/content/specialist-mentors';

interface SpecialistMentorGridProps {
  title: string;
  description: string;
  className?: string;
}

export function SpecialistMentorGrid({
  title,
  description,
  className,
}: SpecialistMentorGridProps) {
  return (
    <div className={className}>
      <div className="app-caption">전문 선생</div>
      <h3 className="mt-3 font-display text-2xl text-[var(--app-ivory)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{description}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {SPECIALIST_MENTORS.map((mentor) => (
          <article
            key={mentor.slug}
            className="rounded-[1.3rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-hanja text-xs tracking-[0.22em] text-[var(--app-gold)]/72">
                  {mentor.hanja}
                </div>
                <h4 className="mt-2 font-display text-xl text-[var(--app-ivory)]">
                  {mentor.title}
                </h4>
              </div>
              <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-[11px] text-[var(--app-copy-muted)]">
                {mentor.statusLabel}
              </span>
            </div>

            <div className="mt-3 text-sm font-medium text-[var(--app-gold-text)]">
              {mentor.specialty}
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{mentor.description}</p>

            <Link
              href={mentor.href}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
            >
              {mentor.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--app-copy-soft)]">
        대화 persona는 순차적으로 확장할 예정이며, 지금은 각 전문 선생이 먼저 잘 맞는 리포트와
        기준서 흐름으로 안내합니다.
      </p>
    </div>
  );
}
