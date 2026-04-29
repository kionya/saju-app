import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  surface?: 'panel' | 'muted' | 'soft';
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

const SURFACE_CLASSNAME: Record<NonNullable<FeatureCardProps['surface']>, string> = {
  panel: 'app-feature-card',
  muted: 'app-feature-card-muted',
  soft: 'app-feature-card-soft',
};

export function FeatureCard({
  eyebrow,
  title,
  description,
  icon,
  badge,
  footer,
  children,
  surface = 'muted',
  className,
  titleClassName,
  descriptionClassName,
}: FeatureCardProps) {
  return (
    <article className={cn(SURFACE_CLASSNAME[surface], className)}>
      {icon || badge ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          {icon ? <div className="shrink-0">{icon}</div> : <div />}
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>
      ) : null}
      {eyebrow ? <div className="app-caption">{eyebrow}</div> : null}
      {title ? (
        <h3 className={cn('app-feature-title', eyebrow ? 'mt-3' : icon || badge ? 'mt-0' : '', titleClassName)}>
          {title}
        </h3>
      ) : null}
      {description ? (
        <div
          className={cn(
            'app-feature-copy',
            title ? 'mt-3' : eyebrow ? 'mt-2' : '',
            descriptionClassName
          )}
        >
          {description}
        </div>
      ) : null}
      {children ? <div className={cn(description || title ? 'mt-4' : '')}>{children}</div> : null}
      {footer ? <div className="mt-4 pt-1">{footer}</div> : null}
    </article>
  );
}
