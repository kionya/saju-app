import { BulletList } from '@/components/layout/bullet-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';

type ReportOneMinuteSummaryProps = {
  headline: string;
  keyThemes: string[];
  cautionPatterns: string[];
  favorableChoices: string[];
  isTimeUnknown?: boolean;
};

function SummaryList({
  title,
  items,
  tone = 'default',
}: {
  title: string;
  items: string[];
  tone?: 'default' | 'caution';
}) {
  if (items.length === 0) return null;

  return (
    <FeatureCard
      surface="soft"
      className={
        tone === 'caution'
          ? 'border-[var(--app-coral)]/18 bg-[var(--app-coral)]/7'
          : undefined
      }
      eyebrow={title}
      children={
        <BulletList
          items={items}
          className="text-sm text-[var(--app-copy)]"
          markerClassName={tone === 'caution' ? 'text-[var(--app-coral)]' : undefined}
        />
      }
    />
  );
}

export function ReportOneMinuteSummary({
  headline,
  keyThemes,
  cautionPatterns,
  favorableChoices,
  isTimeUnknown = false,
}: ReportOneMinuteSummaryProps) {
  return (
    <SectionSurface surface="panel">
      <SectionHeader
        eyebrow="1분 요약"
        title="먼저, 이번 사주의 핵심만 짚어드립니다"
        titleClassName="text-3xl"
        description="자세한 해석은 아래에서 이어지고, 판정 근거는 별도로 펼쳐볼 수 있습니다."
      />

      <FeatureCard
        className="mt-6 border-[var(--app-gold)]/18 bg-[var(--app-gold)]/8"
        surface="soft"
        eyebrow="한 줄 총평"
        description={headline}
        descriptionClassName="text-base leading-8 text-[var(--app-ivory)] sm:text-lg"
      />

      {isTimeUnknown ? (
        <div className="mt-4 rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
          태어난 시간이 정확하지 않아 시주 중심 해석은 보수적으로 낮춰 읽습니다.
        </div>
      ) : null}

      <ProductGrid columns={3} className="mt-4">
        <SummaryList title="올해 핵심 주제" items={keyThemes} />
        <SummaryList title="조심할 패턴" items={cautionPatterns} tone="caution" />
        <SummaryList title="유리한 선택 방식" items={favorableChoices} />
      </ProductGrid>
    </SectionSurface>
  );
}
