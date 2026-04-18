import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  SETTINGS_BLUEPRINT,
} from '@/content/moonlight';
import { PageHero } from '@/shared/layout/app-shell';

export default function MySettingsPage() {
  return (
    <div className="space-y-6">
      <PageHero
        badges={
          <>
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              설정
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              시니어 친화 읽기와 알림 옵션
            </Badge>
          </>
        }
        title="글자, 말투, 알림을 선생님께 맞게 조정하세요"
        description="설정은 단순한 옵션 모음이 아니라 매일 들어오게 만드는 사용감의 핵심입니다. 읽기 부담을 줄이고, 알림 시간과 표현 톤을 본인에게 맞게 맞출 수 있어야 합니다."
      />

      <section className="app-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="app-caption">실제 알림 제어</div>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
            푸시 · 위젯 · 재방문 리마인더는 알림 센터에서 바로 조정합니다
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
            시간대 토글, 알림 스타일, 홈 위젯 크기, 미접속 리마인더 주기를 실제 상태로 저장해 둡니다.
          </p>
        </div>
        <Link
          href="/notifications"
          className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/12 px-5 text-sm font-medium text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
        >
          알림 센터 열기
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {SETTINGS_BLUEPRINT.map((item) => (
          <article key={item.title} className="app-panel p-6">
            <div className="app-caption">{item.title}</div>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--app-ivory)]">
              {item.options}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">
              {item.reason}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
