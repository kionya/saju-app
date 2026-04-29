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
    <section
      className={
        tone === 'caution'
          ? 'rounded-[22px] border border-[var(--app-coral)]/18 bg-[var(--app-coral)]/7 px-5 py-5'
          : 'rounded-[22px] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5'
      }
    >
      <div className="app-caption">{title}</div>
      <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--app-copy)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={tone === 'caution' ? 'text-[var(--app-coral)]' : 'text-[var(--app-gold)]'}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
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
    <section className="app-panel p-6 sm:p-7">
      <div className="app-caption">1분 요약</div>
      <h2 className="mt-3 font-display text-3xl text-[var(--app-ivory)]">
        먼저, 이번 사주의 핵심만 짚어드립니다
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy-muted)]">
        자세한 해석은 아래에서 이어지고, 판정 근거는 별도로 펼쳐볼 수 있습니다.
      </p>

      <div className="mt-6 rounded-[24px] border border-[var(--app-gold)]/18 bg-[var(--app-gold)]/8 px-5 py-5">
        <div className="app-caption">한 줄 총평</div>
        <p className="mt-3 text-base leading-8 text-[var(--app-ivory)] sm:text-lg">{headline}</p>
      </div>

      {isTimeUnknown ? (
        <div className="mt-4 rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
          태어난 시간이 정확하지 않아 시주 중심 해석은 보수적으로 낮춰 읽습니다.
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SummaryList title="올해 핵심 주제" items={keyThemes} />
        <SummaryList title="조심할 패턴" items={cautionPatterns} tone="caution" />
        <SummaryList title="유리한 선택 방식" items={favorableChoices} />
      </div>
    </section>
  );
}
