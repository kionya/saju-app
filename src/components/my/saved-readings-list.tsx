'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { AccountReading } from '@/lib/account';

interface SavedReadingsListProps {
  readings: AccountReading[];
  totalCount: number;
  visibleStartIndex?: number;
}

interface DeleteReadingResponse {
  success?: boolean;
  readingCount?: number;
  error?: string;
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatBirthLabel(reading: AccountReading) {
  const hourLabel = reading.birthHour === null ? '시간 미입력' : `${reading.birthHour}시`;
  const genderLabel =
    reading.gender === 'male'
      ? '남성'
      : reading.gender === 'female'
        ? '여성'
        : '성별 미선택';

  return `${reading.birthYear}.${reading.birthMonth}.${reading.birthDay} · ${hourLabel} · ${genderLabel}`;
}

export default function SavedReadingsList({
  readings,
  totalCount,
  visibleStartIndex = 1,
}: SavedReadingsListProps) {
  const router = useRouter();
  const [items, setItems] = useState(readings);
  const [count, setCount] = useState(totalCount);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const visibleRangeLabel =
    items.length > 0
      ? `${visibleStartIndex}~${visibleStartIndex + items.length - 1}번째`
      : '현재 페이지 비어 있음';

  async function deleteReading(id: string) {
    const confirmed = window.confirm('이 결과를 보관함에서 삭제할까요? 삭제 후에는 복구할 수 없습니다.');
    if (!confirmed) return;

    setDeletingId(id);
    setMessage('');

    try {
      const response = await fetch('/api/readings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = (await response.json().catch(() => null)) as DeleteReadingResponse | null;

      if (!response.ok) {
        setMessage(data?.error ?? '결과를 삭제하지 못했습니다.');
        return;
      }

      setItems((current) => current.filter((reading) => reading.id !== id));
      setCount((current) =>
        typeof data?.readingCount === 'number' ? data.readingCount : Math.max(0, current - 1)
      );
      setMessage('결과보관함에서 삭제했습니다. 서버 기준 저장 개수도 함께 갱신했습니다.');
      router.refresh();
    } catch {
      setMessage('삭제 중 네트워크 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm text-[var(--app-copy)]">
        전체 <span className="font-semibold text-[var(--app-gold-text)]">{count}개</span> 중{' '}
        <span className="font-semibold text-[var(--app-ivory)]">{visibleRangeLabel}</span>를 보고 있습니다.
        이미 만든 결과는 다시 열어 비교할 수 있고, 삭제하면 서버 기준 개수도 함께 줄어듭니다.
      </div>

      {message ? (
        <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm text-[var(--app-gold-text)]">
          {message}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="app-panel-muted border-dashed p-7 text-sm leading-7 text-[var(--app-copy-muted)]">
          {count > 0
            ? '현재 페이지의 결과를 모두 삭제했습니다. 새로고침 후 남은 결과 페이지로 정리됩니다.'
            : '아직 저장된 결과가 없습니다. 새 사주 리포트를 만들면 결과보관함에 자동으로 쌓입니다.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((reading) => (
            <article key={reading.id} className="app-panel p-6">
              <Link
                href={`/saju/${reading.id}`}
                className="block transition-colors hover:text-[var(--app-gold-text)]"
              >
                <div className="app-caption">저장일 {formatCreatedAt(reading.createdAt)}</div>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
                  {reading.birthMonth}월 {reading.birthDay}일 리포트
                </h2>
                <p className="app-body-copy mt-4 text-sm">{formatBirthLabel(reading)}</p>
                <div className="mt-6 text-sm text-[var(--app-gold-soft)]">리포트 다시 열기</div>
              </Link>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-line)] pt-4">
                <span className="text-xs leading-5 text-[var(--app-copy-soft)]">
                  이미 만든 결과는 보관함에서 다시 열 수 있습니다.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={deletingId === reading.id}
                  onClick={() => deleteReading(reading.id)}
                  className="h-9 rounded-full border-rose-400/25 bg-rose-400/8 px-4 text-xs text-rose-100 hover:bg-rose-400/14"
                >
                  {deletingId === reading.id ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
