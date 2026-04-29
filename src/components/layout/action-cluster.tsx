import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ActionClusterProps {
  children: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function ActionCluster({
  children,
  align = 'left',
  className,
}: ActionClusterProps) {
  return (
    <div
      className={cn(
        'app-action-cluster',
        align === 'center' ? 'justify-center' : 'justify-start',
        className
      )}
    >
      {children}
    </div>
  );
}
