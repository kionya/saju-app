import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '동의',
  description: '필수 동의를 짧고 투명하게 정리한 뒤 실제 사주 결과 생성으로 이어지는 마지막 단계입니다.',
  alternates: {
    canonical: '/saju/new/consent',
  },
};

export default function SajuConsentPage() {
  redirect('/saju/new');
}
