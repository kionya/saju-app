import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getAccountDashboardData } from '@/lib/account';
import { PageHero } from '@/shared/layout/app-shell';

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatBirthLabel(reading: {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  gender: 'male' | 'female' | null;
}) {
  const hourLabel = reading.birthHour === null ? '시간 미입력' : `${reading.birthHour}시`;
  const genderLabel =
    reading.gender === 'male'
      ? '남성'
      : reading.gender === 'female'
        ? '여성'
        : '성별 미선택';

  return `${reading.birthYear}.${reading.birthMonth}.${reading.birthDay} · ${hourLabel} · ${genderLabel}`;
}

export default async function MyResultsPage() {
  const dashboard = await getAccountDashboardData('/my/results', {
    readingLimit: 30,
    transactionLimit: 1,
  });

  return (
    <>
      <PageHero
        badges={
          <>
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              Result Archive
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              로그인 후 생성한 결과 자동 보관
            </Badge>
          </>
        }
        title="결과보관함"
        description="저장된 결과를 다시 보고, 질문 포커스를 바꿔 비교하면서 이어 읽을 수 있게 구성했습니다. 한 번 본 결과가 흩어지지 않고 자연스럽게 다음 행동으로 이어지는 아카이브입니다."
      />

      <section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.recentReadings.length > 0 ? (
            dashboard.recentReadings.map((reading) => (
              <Link
                key={reading.id}
                href={`/saju/${reading.id}`}
                className="app-panel block p-6 transition-colors hover:bg-[var(--app-surface-strong)]"
              >
                <div className="app-caption">저장일 {formatCreatedAt(reading.createdAt)}</div>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
                  {reading.birthMonth}월 {reading.birthDay}일 리포트
                </h2>
                <p className="app-body-copy mt-4 text-sm">{formatBirthLabel(reading)}</p>
                <div className="mt-6 text-sm text-[var(--app-gold-soft)]">리포트 다시 열기</div>
              </Link>
            ))
          ) : (
            <div className="app-panel-muted border-dashed p-7 text-sm leading-7 text-[var(--app-copy-muted)]">
              아직 저장된 결과가 없습니다. 새 사주 리포트를 만들면 결과보관함에 자동으로 쌓입니다.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
