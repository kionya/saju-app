import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  header?: ReactNode;
  dock?: ReactNode;
  className?: string;
}

interface AppPageProps {
  children: ReactNode;
  className?: string;
}

interface PageHeroProps {
  title: ReactNode;
  description?: ReactNode;
  badges?: ReactNode;
  className?: string;
}

export function AppShell({ children, header, dock, className }: AppShellProps) {
  return (
    <main className={cn('app-shell', className)}>
      {header}
      {children}
      {dock}
    </main>
  );
}

export function AppPage({ children, className }: AppPageProps) {
  return <div className={cn('app-page app-page-spacious', className)}>{children}</div>;
}

export function PageHero({ title, description, badges, className }: PageHeroProps) {
  return (
    <section className={cn('app-hero-card p-7 sm:p-8', className)}>
      {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--app-ivory)] sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="app-body-copy mt-4 max-w-3xl text-base sm:text-lg">{description}</p>
      ) : null}
    </section>
  );
}
