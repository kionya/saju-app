export default function CompatibilitySection() {
  return (
    <section id="compatibility-lab" className="border-y border-white/8 bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-[#d2b072]/75">Compatibility</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#f8f1df]">궁합도 입력 난도에 따라 두 겹으로 나눕니다</h2>
            <p className="text-sm leading-7 text-white/60 sm:text-base">
              먼저 가볍게 보는 Lite 궁합으로 진입시키고, 상세 궁합은 관계 포인트와 조심할 흐름까지 묶어 유료로 열어주는 구조가 적합합니다.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: '연애궁합 Lite',
                desc: '상대와의 온도 차이, 연락 템포, 감정 거리만 먼저 보여주는 무료/저가형 입구',
                price: '무료 또는 500원',
              },
              {
                title: '연애궁합 상세',
                desc: '두 사람의 사주 흐름, 강점·마찰 포인트, 관계 유지 팁까지 묶는 프리미엄 리포트',
                price: '990원 이상',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6">
                <div className="text-sm text-[#d2b072]/80">{item.price}</div>
                <h3 className="mt-3 text-2xl font-semibold text-[#f8f1df]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/58">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
