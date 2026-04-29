import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BulletListProps {
  items: readonly ReactNode[];
  className?: string;
  itemClassName?: string;
  markerClassName?: string;
}

export function BulletList({
  items,
  className,
  itemClassName,
  markerClassName,
}: BulletListProps) {
  return (
    <ul className={cn('app-bullet-list', className)}>
      {items.map((item, index) => (
        <li key={index} className={cn('app-bullet-item', itemClassName)}>
          <span className={cn('app-bullet-marker', markerClassName)} aria-hidden>
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
