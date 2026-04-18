import type { Metadata } from 'next';
import NotificationCenterPage from '@/features/notifications/notification-center-page';
import { getNotificationSnapshot } from '@/lib/notifications';

export const metadata: Metadata = {
  title: '푸시 스케줄',
  description: '아침, 점심, 저녁, 주간, 절기 알림까지 시간대별 재방문 스케줄을 관리하는 화면입니다.',
  alternates: {
    canonical: '/notifications/schedule',
  },
};

export default async function NotificationSchedulePage() {
  const snapshot = await getNotificationSnapshot();

  return <NotificationCenterPage mode="schedule" snapshot={snapshot} />;
}
