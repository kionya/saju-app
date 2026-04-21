'use client';

import { useEffect, useState } from 'react';
import {
  getTarotCardImagePath,
  getTarotCardVisualTone,
} from '@/lib/tarot-card-assets';
import { cn } from '@/lib/utils';

interface TarotCardArtworkProps {
  cardId: string;
  shortName: string;
  displayName: string;
  cardMarker: string;
  orientation: 'upright' | 'reversed';
  orientationLabel: string;
  arcanaLabel: string;
  className?: string;
}

export function TarotCardArtwork({
  cardId,
  shortName,
  displayName,
  cardMarker,
  orientation,
  orientationLabel,
  arcanaLabel,
  className,
}: TarotCardArtworkProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const imagePath = getTarotCardImagePath(cardId);
  const tone = getTarotCardVisualTone(cardId);

  useEffect(() => {
    setImageState('loading');
  }, [imagePath]);

  return (
    <figure
      className={cn(
        'relative mx-auto aspect-[7/10] w-[min(14rem,76vw)] overflow-hidden rounded-[1.15rem] border-2 shadow-[0_24px_70px_rgba(0,0,0,0.34)]',
        tone.borderClassName,
        tone.backgroundClassName,
        className
      )}
    >
      <div className="absolute inset-0 p-5">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <span className={cn('font-[var(--font-heading)] text-xs tracking-[0.22em]', tone.accentClassName)}>
              {shortName}
            </span>
            <span className="text-[10px] tracking-[0.18em] text-[var(--app-copy-soft)]">
              {tone.label}
            </span>
          </div>

          <div className="grid place-items-center">
            <div
              className={cn(
                'grid h-28 w-28 place-items-center rounded-full border',
                tone.motifClassName
              )}
            >
              <div className={cn('font-[var(--font-heading)] text-6xl', tone.accentClassName)}>
                {cardMarker || tone.marker}
              </div>
            </div>
          </div>

          <div>
            <div className={cn('font-[var(--font-heading)] text-[11px] tracking-[0.26em]', tone.accentClassName)}>
              {orientationLabel}
            </div>
            <figcaption className="mt-2 line-clamp-2 font-[var(--font-heading)] text-xl leading-tight text-[var(--app-ivory)]">
              {displayName}
            </figcaption>
            <div className="mt-2 text-xs text-[var(--app-copy-soft)]">{arcanaLabel}</div>
          </div>
        </div>
      </div>

      <img
        src={imagePath}
        alt={displayName}
        onLoad={() => setImageState('loaded')}
        onError={() => setImageState('failed')}
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
          orientation === 'reversed' && 'rotate-180'
        )}
      />

      {imageState === 'failed' ? (
        <div className="absolute inset-x-4 bottom-4 rounded-full border border-[var(--app-line)] bg-[rgba(8,10,18,0.7)] px-3 py-2 text-center text-[10px] tracking-[0.16em] text-[var(--app-copy-soft)] backdrop-blur">
          이미지 추가 시 자동 표시
        </div>
      ) : null}
    </figure>
  );
}
