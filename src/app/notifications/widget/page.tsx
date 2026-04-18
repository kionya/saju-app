import type { Metadata } from 'next';
import NotificationCenterPage from '@/features/notifications/notification-center-page';
import { getNotificationSnapshot } from '@/lib/notifications';

export const metadata: Metadata = {
  title: '홈 위젯',
  description: '작은 위젯과 중간 위젯 미리보기, 최근 결과 연동 상태를 확인하는 홈 위젯 화면입니다.',
  alternates: {
    canonical: '/notifications/widget',
  },
};

export default async function NotificationWidgetPage() {
  const snapshot = await getNotificationSnapshot();

  return <NotificationCenterPage mode="widget" snapshot={snapshot} />;
}
