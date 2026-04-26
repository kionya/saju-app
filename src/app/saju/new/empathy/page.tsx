import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '사주 시작',
  description: '문득 떠오르는 질문에서 시작해 달빛선생의 사주 여정으로 안내하는 첫 공감 화면입니다.',
  alternates: {
    canonical: '/saju/new/empathy',
  },
};

export default function SajuEmpathyPage() {
  redirect('/saju/new');
}
