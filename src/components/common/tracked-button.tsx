'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { trackMoonlightEvent } from '@/lib/analytics';
import type { MoonlightAnalyticsEvent } from '@/lib/analytics-events';

type TrackedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  eventName: MoonlightAnalyticsEvent;
  eventParams?: Record<string, unknown>;
};

export function TrackedButton({
  children,
  eventName,
  eventParams,
  onClick,
  ...props
}: TrackedButtonProps) {
  return (
    <button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          trackMoonlightEvent(eventName, eventParams);
        }
      }}
    >
      {children}
    </button>
  );
}
