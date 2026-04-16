import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { getAccountDashboardData } from '@/lib/account';

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
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              Result Archive
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              로그인 후 생성된 결과 자동 저장
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            결과보관함
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
            저장된 결과는 다시보기와 비교가 쉬워야 합니다. 그래서 이 공간은 한 번 보고 끝나는 결과가 아니라, 나중에 다시 열어보며 패턴을 확인하는 아카이브 역할을 합니다.
          </p>
        </section>

        <section className="mt-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.recentReadings.length > 0 ? (
              dashboard.recentReadings.map((reading) => (
                <Link
                  key={reading.id}
                  href={`/saju/${reading.id}`}
                  className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.07]"
                >
                  <div className="text-sm text-white/45">저장일 {formatCreatedAt(reading.createdAt)}</div>
                  <h2 className="mt-3 text-2xl font-semibold text-[#f8f1df]">
                    {reading.birthMonth}월 {reading.birthDay}일 리포트
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/60">
                    {formatBirthLabel(reading)}
                  </p>
                  <div className="mt-6 text-sm text-[#d2b072]">리포트 다시 열기</div>
                </Link>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] p-7 text-sm leading-7 text-white/58">
                아직 저장된 결과가 없습니다. 홈에서 새 사주 리포트를 만들면 이곳에 자동으로 보관됩니다.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
