import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const GRID_BY_COLUMNS: Record<NonNullable<ProductGridProps['columns']>, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 xl:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4',
};

export function ProductGrid({
  children,
  columns = 4,
  className,
}: ProductGridProps) {
  return (
    <div className={cn('app-card-grid', GRID_BY_COLUMNS[columns], className)}>
      {children}
    </div>
  );
}
