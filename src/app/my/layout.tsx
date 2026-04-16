import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MY',
  description: '내 사주 결과, 코인 잔액, 결제 및 구독 상태를 관리하는 페이지입니다.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function MyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
