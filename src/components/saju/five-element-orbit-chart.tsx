import { ELEMENT_INFO } from '@/lib/saju/elements';
import type { Element } from '@/lib/saju/types';

const ELEMENT_ORDER: Element[] = ['목', '화', '토', '금', '수'];
const ELEMENT_HANJA: Record<Element, string> = {
  목: '木',
  화: '火',
  토: '土',
  금: '金',
  수: '水',
};

const ORBIT_LAYOUT: Record<Element, { angle: number; x: number; y: number }> = {
  목: { angle: -90, x: 50, y: 14 },
  화: { angle: -18, x: 80, y: 35 },
  토: { angle: 54, x: 69, y: 74 },
  금: { angle: 126, x: 31, y: 74 },
  수: { angle: 198, x: 20, y: 35 },
};

interface FiveElementValue {
  count: number;
  score: number;
  percentage: number;
  state: string;
}

interface FiveElementOrbitChartProps {
  byElement: Record<Element, FiveElementValue>;
  dominant: Element;
  weakest: Element;
}

function polarPoint(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: 160 + Math.cos(rad) * radius,
    y: 160 + Math.sin(rad) * radius,
  };
}

export default function FiveElementOrbitChart({
  byElement,
  dominant,
  weakest,
}: FiveElementOrbitChartProps) {
  const framePoints = ELEMENT_ORDER.map((element) => {
    const point = polarPoint(ORBIT_LAYOUT[element].angle, 104);
    return `${point.x},${point.y}`;
  }).join(' ');

  const dataPoints = ELEMENT_ORDER.map((element) => {
    const radius = 56 + byElement[element].percentage * 0.5;
    const point = polarPoint(ORBIT_LAYOUT[element].angle, radius);
    return `${point.x},${point.y}`;
  }).join(' ');

  return (
    <div className="app-element-orbit">
      <svg
        viewBox="0 0 320 320"
        className="app-element-orbit-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="element-gold-ring" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(236, 201, 133, 0.72)" />
            <stop offset="100%" stopColor="rgba(236, 201, 133, 0.1)" />
          </linearGradient>
          <radialGradient id="element-core-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(236, 201, 133, 0.16)" />
            <stop offset="100%" stopColor="rgba(236, 201, 133, 0)" />
          </radialGradient>
        </defs>
        <circle cx="160" cy="160" r="130" className="app-element-orbit-ring app-element-orbit-ring--outer" />
        <circle cx="160" cy="160" r="102" className="app-element-orbit-ring" />
        <circle cx="160" cy="160" r="72" className="app-element-orbit-ring" />
        <circle cx="160" cy="160" r="50" fill="url(#element-core-glow)" />
        <polygon points={framePoints} className="app-element-orbit-frame" />
        <polygon points={dataPoints} className="app-element-orbit-data" />
        {ELEMENT_ORDER.map((element) => {
          const point = polarPoint(ORBIT_LAYOUT[element].angle, 104);
          return (
            <line
              key={element}
              x1="160"
              y1="160"
              x2={point.x}
              y2={point.y}
              className="app-element-orbit-spoke"
            />
          );
        })}
      </svg>

      <div className="app-element-orbit-core">
        <div className="app-caption">오행 중심</div>
        <div className="mt-3 font-[var(--font-heading)] text-[1.9rem] text-[var(--app-gold-text)]">
          五行
        </div>
        <div className="mt-2 text-sm leading-6 text-[var(--app-copy-muted)]">
          주도 {ELEMENT_HANJA[dominant]} · 보완 {ELEMENT_HANJA[weakest]}
        </div>
      </div>

      {ELEMENT_ORDER.map((element) => {
        const value = byElement[element];
        const size = 74 + value.percentage * 0.22;
        const isDominant = dominant === element;
        const isWeakest = weakest === element;

        return (
          <div
            key={element}
            className="app-element-orbit-node"
            style={{
              left: `${ORBIT_LAYOUT[element].x}%`,
              top: `${ORBIT_LAYOUT[element].y}%`,
              width: `${size}px`,
              height: `${size}px`,
              ['--element-accent' as string]: ELEMENT_INFO[element].color,
            }}
            data-dominant={isDominant}
            data-weakest={isWeakest}
          >
            <div className="app-element-orbit-node-hanja">{ELEMENT_HANJA[element]}</div>
            <div className="app-element-orbit-node-label">{element}</div>
            <div className="app-element-orbit-node-value">{Math.round(value.percentage)}%</div>
            {isDominant ? (
              <div className="app-element-orbit-node-tag">주도</div>
            ) : isWeakest ? (
              <div className="app-element-orbit-node-tag">보완</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
