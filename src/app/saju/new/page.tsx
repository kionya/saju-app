import type { Metadata } from 'next';
import SajuIntakePage from '@/features/saju-intake/saju-intake-page';

export const metadata: Metadata = {
  title: '사주 시작하기',
  description: '양력·음력, 태어난 시간, 출생지를 입력하고 바로 내 사주 기본 해석으로 이어지는 시작 화면입니다.',
  alternates: {
    canonical: '/saju/new',
  },
};

export default function Page() {
  return <SajuIntakePage step="birth" />;
}
