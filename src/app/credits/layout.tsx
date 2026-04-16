import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '크레딧 충전',
  description: '상세 해석, AI 상담, 궁합 분석에 사용할 크레딧 상품을 확인하고 충전하세요.',
  alternates: {
    canonical: '/credits',
  },
};

export default function CreditsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
