import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '멤버십',
  description: '사주명리 Plus 멤버십과 준비 중인 Pro 멤버십 혜택을 확인하세요.',
  alternates: {
    canonical: '/membership',
  },
};

const PLUS_FEATURES = [
  '광고 없이 보는 데일리 리포트',
  '월간 심화 리포트 2회',
  '매달 30코인 자동 충전',
  '결과 보관함과 운세 캘린더 우선 제공',
];

const PRO_FEATURES = [
  '가족 프로필 여러 개 관리',
  '심화 리포트 전용 추가 코인',
  '무제한 다시보기와 우선 상담 쿠폰',
  '헤비유저와 가족 단위 사용에 맞춘 관리 기능',
];

export default function MembershipPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(210,176,114,0.18),_transparent_26%),linear-gradient(180deg,_#071327_0%,_#020817_72%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Badge className="border-[#d2b072]/35 bg-[#d2b072]/10 text-[#f2d9a2]">
            반복 효용 중심 멤버십 설계
          </Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#f8f1df] sm:text-5xl">
            단건 리포트를 넘어서
            <span className="block text-[#d9bc7f]">매일 다시 들어오게 만드는 Plus 구조</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/66 sm:text-lg">
            9,900원은 리포트 한 개 가격이 아니라 반복 소비와 저장 가치가 묶여야 설득력이 생깁니다.
            그래서 사주명리 멤버십은 데일리 리포트, 코인 자동 충전, 결과 보관과 캘린더처럼 계속 돌아오게 만드는 기능을 중심으로 설계합니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[32px] border border-[#d2b072]/20 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.94))] p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-[#d2b072]/78">Plus</div>
                <h2 className="mt-3 text-3xl font-semibold text-[#f8f1df]">월 9,900원</h2>
              </div>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">지금 제공</Badge>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/62">
              첫 결제 이후에 가장 자연스럽게 이어질 월간 상품입니다. 무료 유입으로 들어온 사용자가 다시보기와 데일리 루틴을 느낄 때 가장 잘 맞는 구조입니다.
            </p>

            <div className="mt-6 space-y-3">
              {PLUS_FEATURES.map((feature) => (
                <div key={feature} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72">
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/60">
              정기결제 전 안내:
              가격, 갱신 주기, 제공 개시 시점, 해지/관리 경로를 결제 직전 다시 한 번 명확히 표시하는 방향으로 맞춥니다.
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/credits">
                <Button className="h-12 rounded-full bg-[#d2b072] px-6 text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]">
                  Plus 시작하기
                </Button>
              </Link>
              <Link href="/#personalized-reading">
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-sm text-white hover:bg-white/10 hover:text-white"
                >
                  무료 결과 먼저 보기
                </Button>
              </Link>
            </div>
          </article>

          <article className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-white/46">Pro</div>
                <h2 className="mt-3 text-3xl font-semibold text-[#f8f1df]">월 29,900원</h2>
              </div>
              <Badge className="border-white/10 bg-white/5 text-white/58">곧 오픈</Badge>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/62">
              상담 마켓이 아니라 헤비유저와 가족 단위 사용자를 위한 관리형 상품으로 설계합니다.
              지금 단계에서는 바로 열기보다, Plus 사용 패턴이 쌓인 뒤 확장하는 편이 안정적입니다.
            </p>

            <div className="mt-6 space-y-3">
              {PRO_FEATURES.map((feature) => (
                <div key={feature} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/68">
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[#d2b072]/16 bg-[#d2b072]/8 p-4 text-sm leading-7 text-white/62">
              런칭 우선순위:
              상담 기능과 운영형 비즈니스는 2차 오픈으로 미루고, 먼저 무료 유입과 코인 소비, Plus 리텐션 구조를 굳히는 것이 더 좋습니다.
            </div>
          </article>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: '무료',
              body: '오늘의 타로, 가벼운 운세, 짧은 요약 리포트로 첫 경험을 만든다.',
            },
            {
              title: '코인 언락',
              body: '500원·990원·2,000원은 심화 풀이와 주제 확장에 쓰는 첫 결제 진입 구조다.',
            },
            {
              title: '멤버십',
              body: '매일 다시 오게 만드는 반복 효용을 제공해 D30 리텐션을 끌어올린다.',
            },
          ].map((item) => (
            <article key={item.title} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold text-[#f8f1df]">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/60">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
