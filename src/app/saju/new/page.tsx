import type { Metadata } from 'next';
import SajuIntakePage from '@/features/saju-intake/saju-intake-page';

export const metadata: Metadata = {
  title: '사주 시작',
  description: '무입력, 저입력, 정밀입력 3단계로 사주 리포트를 시작하는 전용 입력 페이지입니다.',
  alternates: {
    canonical: '/saju/new',
  },
};

export default function Page() {
  return <SajuIntakePage />;
}
