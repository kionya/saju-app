import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '코인 센터',
  description: '상세 해석과 월간 Plus 멤버십에 사용할 코인 상품을 확인하고 결제하세요.',
  alternates: {
    canonical: '/credits',
  },
};

export default function CreditsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
