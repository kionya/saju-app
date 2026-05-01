import type { Metadata } from 'next';
import { COMPATIBILITY_RELATIONSHIPS, type CompatibilityRelationshipSlug } from '@/content/moonlight';
import { CompatibilityInputClient } from '@/features/compatibility/compatibility-input-client';

interface Props {
  searchParams: Promise<{ relationship?: string }>;
}

function resolveRelationship(value: string | undefined): CompatibilityRelationshipSlug {
  return COMPATIBILITY_RELATIONSHIPS.some((item) => item.slug === value)
    ? (value as CompatibilityRelationshipSlug)
    : 'lover';
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '궁합 입력',
    description: '내 정보와 상대 정보를 직접 입력하거나 저장된 정보를 불러와 궁합을 준비하는 화면입니다.',
  };
}

export default async function CompatibilityInputPage({ searchParams }: Props) {
  const { relationship } = await searchParams;

  return <CompatibilityInputClient initialRelationship={resolveRelationship(relationship)} />;
}
