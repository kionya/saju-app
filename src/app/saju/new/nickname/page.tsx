import type { Metadata } from 'next';
import SajuIntakePage from '@/features/saju-intake/saju-intake-page';

export const metadata: Metadata = {
  title: '호칭 설정',
  description: '편한 호칭과 말투를 정해 달빛선생이 결과 전반에서 더 자연스럽게 말을 건네는 단계입니다.',
  alternates: {
    canonical: '/saju/new/nickname',
  },
};

export default function SajuNicknamePage() {
  return <SajuIntakePage step="nickname" />;
}
