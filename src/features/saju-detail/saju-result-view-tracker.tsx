'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackMoonlightEvent } from '@/lib/analytics';

export function SajuResultViewTracker({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;

    trackMoonlightEvent('saju_result_viewed', {
      from: searchParams.get('from') ?? 'direct',
      sourceSessionId: slug,
    });
    trackedRef.current = true;
  }, [searchParams, slug]);

  return null;
}
