'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import HeroSection from '@/components/home/hero-section';
import FreeEntrySection from '@/components/home/free-entry-section';
import PersonalizedReadingSection from '@/components/home/personalized-reading-section';
import TarotSection from '@/components/home/tarot-section';
import CompatibilitySection from '@/components/home/compatibility-section';
import MembershipSection from '@/components/home/membership-section';
import type { FocusTopic } from '@/lib/saju/report';

export default function HomePage() {
  const router = useRouter();
  const maxYear = new Date().getFullYear();
  const [selectedTopic, setSelectedTopic] = useState<FocusTopic>('today');
  const [form, setForm] = useState({ year: '', month: '', day: '', hour: '', gender: 'male' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { year, month, day, hour, gender } = form;
    if (!year || !month || !day) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          day: parseInt(day, 10),
          hour: hour ? parseInt(hour, 10) : undefined,
          gender,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.id) {
        setFormError(data.error ?? '사주 결과를 생성하지 못했습니다.');
        return;
      }

      router.push(`/saju/${data.id}?topic=${selectedTopic}`);
    } catch {
      setFormError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFormChange(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />
      <HeroSection selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
      <FreeEntrySection />
      <PersonalizedReadingSection
        selectedTopic={selectedTopic}
        form={form}
        formError={formError}
        isSubmitting={isSubmitting}
        maxYear={maxYear}
        onSelectTopic={setSelectedTopic}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
      />
      <TarotSection />
      <CompatibilitySection />
      <MembershipSection />
    </main>
  );
}
