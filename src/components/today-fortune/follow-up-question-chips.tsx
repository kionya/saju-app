'use client';

import { useRouter } from 'next/navigation';
import { trackMoonlightEvent } from '@/lib/analytics';
import type { ConcernId } from '@/lib/today-fortune/types';

interface FollowUpQuestionChipsProps {
  questions: string[];
  sourceSessionId: string;
  concernId: ConcernId;
}

export function FollowUpQuestionChips({
  questions,
  sourceSessionId,
  concernId,
}: FollowUpQuestionChipsProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="app-caption">결과 기반 후속 질문</div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => {
              trackMoonlightEvent('followup_question_clicked', {
                from: 'today-fortune',
                concern: concernId,
                sourceSessionId,
                question,
              });
              router.push(
                `/dialogue?question=${encodeURIComponent(question)}&sourceSessionId=${encodeURIComponent(sourceSessionId)}&concern=${encodeURIComponent(concernId)}&from=today-fortune&autoStart=1`
              );
            }}
            className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-2 text-xs text-[var(--app-copy)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--app-gold)]/28 hover:text-[var(--app-ivory)]"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
