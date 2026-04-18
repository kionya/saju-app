import type { Metadata } from 'next';
import SajuIntakePage from '@/features/saju-intake/saju-intake-page';

export const metadata: Metadata = {
  title: '생년월일시 입력',
  description: '생년월일시와 성별을 차분히 묻고, 시간을 몰라도 안심하고 시작할 수 있게 설계한 사주 입력 화면입니다.',
  alternates: {
    canonical: '/saju/new/birth',
  },
};

export default function SajuBirthPage() {
  return <SajuIntakePage step="birth" />;
}
