import type { Metadata } from 'next';
import SajuIntakePage from '@/features/saju-intake/saju-intake-page';

export const metadata: Metadata = {
  title: '달빛선생',
  description: '달빛선생의 사주 여정을 시작하기 전, 달빛과 한 줄의 약속으로 맞이하는 스플래시 화면입니다.',
  alternates: {
    canonical: '/saju/new',
  },
};

export default function Page() {
  return <SajuIntakePage step="splash" />;
}
