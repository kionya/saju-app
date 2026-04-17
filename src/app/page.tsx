'use client';

import { useState } from 'react';
import SiteHeader from '@/features/shared-navigation/site-header';
import HeroSection from '@/features/home/hero-section';
import ServiceEntrySection from '@/features/home/service-entry-section';
import ServiceIntakePreviewSection from '@/features/home/service-intake-preview-section';
import TarotSection from '@/features/home/tarot-section';
import CompatibilitySection from '@/features/home/compatibility-section';
import MembershipSection from '@/features/home/membership-section';
import SeoEntrySection from '@/features/home/seo-entry-section';
import MobileHomeDock from '@/features/home/mobile-home-dock';
import { AppShell } from '@/shared/layout/app-shell';
import type { FocusTopic } from '@/lib/saju/report';

export default function HomePage() {
  const [selectedTopic, setSelectedTopic] = useState<FocusTopic>('today');

  return (
    <AppShell header={<SiteHeader />} dock={<MobileHomeDock />} className="pb-24 md:pb-0">
      <HeroSection selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
      <ServiceEntrySection />
      <ServiceIntakePreviewSection selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
      <CompatibilitySection />
      <MembershipSection />
      <SeoEntrySection />
      <TarotSection />
    </AppShell>
  );
}
