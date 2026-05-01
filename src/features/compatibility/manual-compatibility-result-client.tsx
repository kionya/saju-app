'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ActionCluster } from '@/components/layout/action-cluster';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { Badge } from '@/components/ui/badge';
import { COMPATIBILITY_RELATIONSHIPS, type CompatibilityRelationshipSlug } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import {
  isManualCompatibilityPayload,
  MANUAL_COMPATIBILITY_SESSION_KEY,
  type ManualCompatibilityPayload,
} from '@/features/compatibility/manual-compatibility-storage';
import { CompatibilityResultView } from '@/features/compatibility/compatibility-result-view';
import { buildCompatibilityInterpretation } from '@/lib/compatibility';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

interface ManualCompatibilityResultClientProps {
  relationship?: string;
}

function resolveRelationship(value: string | undefined): CompatibilityRelationshipSlug {
  return COMPATIBILITY_RELATIONSHIPS.some((item) => item.slug === value)
    ? (value as CompatibilityRelationshipSlug)
    : 'lover';
}

function MissingManualState({ relationship }: { relationship: CompatibilityRelationshipSlug }) {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="manual-missing"
              className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]"
            >
              궁합 입력 필요
            </Badge>,
          ]}
          title="두 사람 정보를 먼저 입력해 주세요"
          description="비로그인 궁합은 이 브라우저 안에 입력 정보를 잠시 보관해 결과를 만듭니다. 입력 정보가 없으면 새로 입력한 뒤 바로 결과를 열 수 있습니다."
        />
        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="다음 단계"
            title="내 정보와 상대 정보를 함께 입력하면 바로 궁합을 볼 수 있습니다"
            titleClassName="text-3xl"
            description="저장된 사람을 고르지 않아도 괜찮습니다. 이름 또는 호칭, 생년월일, 가능한 범위의 출생 시간만 입력하면 기본 궁합 결과로 이어집니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            actions={
              <ActionCluster>
                <Link href={`/compatibility/input?relationship=${relationship}`} className="moon-cta-primary">
                  두 사람 정보 입력하기
                </Link>
                <Link
                  href="/compatibility"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface-strong)]"
                >
                  궁합 허브로
                </Link>
              </ActionCluster>
            }
          />
        </SectionSurface>
      </AppPage>
    </AppShell>
  );
}

export function ManualCompatibilityResultClient({ relationship }: ManualCompatibilityResultClientProps) {
  const [payload, setPayload] = useState<ManualCompatibilityPayload | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const requestedRelationship = resolveRelationship(relationship);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(MANUAL_COMPATIBILITY_SESSION_KEY);
    let parsed: unknown = null;

    try {
      parsed = stored ? JSON.parse(stored) : null;
    } catch {
      parsed = null;
    }

    if (isManualCompatibilityPayload(parsed)) {
      setPayload(parsed);
    }

    setIsLoaded(true);
  }, []);

  const effectiveRelationship = payload?.relationship ?? requestedRelationship;
  const selected =
    COMPATIBILITY_RELATIONSHIPS.find((item) => item.slug === effectiveRelationship) ??
    COMPATIBILITY_RELATIONSHIPS[0];
  const compatibility = useMemo(() => {
    if (!payload) return null;

    return buildCompatibilityInterpretation(payload.relationship, {
      name: payload.selfName,
      birthInput: payload.selfBirthInput,
    }, {
      name: payload.partnerName,
      birthInput: payload.partnerBirthInput,
    });
  }, [payload]);

  if (!isLoaded) {
    return (
      <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
        <AppPage className="space-y-6">
          <SectionSurface surface="panel" size="lg">
            <div className="text-sm text-[var(--app-copy-muted)]">입력하신 궁합 정보를 확인하고 있습니다.</div>
          </SectionSurface>
        </AppPage>
      </AppShell>
    );
  }

  if (!payload || !compatibility) {
    return <MissingManualState relationship={requestedRelationship} />;
  }

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <AppPage className="space-y-6">
        <CompatibilityResultView
          selected={selected}
          compatibility={compatibility}
          selfName={payload.selfName}
          partnerName={payload.partnerName}
          selfBirthSummary={payload.selfBirthSummary}
          partnerBirthSummary={payload.partnerBirthSummary}
          retakeHref={`/compatibility/input?relationship=${selected.slug}`}
        />
      </AppPage>
    </AppShell>
  );
}
