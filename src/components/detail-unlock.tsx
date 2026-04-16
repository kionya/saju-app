'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DetailContent {
  wealth: string;
  love: string;
  career: string;
  health: string;
  luckyColor: string;
  luckyKeywords: string[];
}

interface Props {
  slug: string;
}

const SECTIONS = [
  { key: 'wealth', icon: '💰', label: '재물운' },
  { key: 'love',   icon: '💕', label: '애정운' },
  { key: 'career', icon: '💼', label: '직업운' },
  { key: 'health', icon: '🌿', label: '건강운' },
] as const;

export default function DetailUnlock({ slug }: Props) {
  const [state, setState] = useState<'locked' | 'loading' | 'unlocked' | 'error'>('locked');
  const [content, setContent] = useState<DetailContent | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);

  async function handleUnlock() {
    setState('loading');
    try {
      const res = await fetch('/api/credits/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: 'detail_report', slug }),
      });

      const data = await res.json();

      if (res.status === 401) {
        location.href = `/login?next=${encodeURIComponent(location.pathname)}`;
        return;
      }
      if (!res.ok) {
        setErrorMsg(data.error ?? '오류가 발생했습니다.');
        setRemaining(data.remaining ?? 0);
        setState('error');
        return;
      }

      setContent(data.content);
      setRemaining(data.remaining);
      setState('unlocked');
    } catch {
      setErrorMsg('서버 오류가 발생했습니다.');
      setState('error');
    }
  }

  if (state === 'unlocked' && content) {
    return (
      <div className="bg-white/5 border border-indigo-500/30 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">상세 해석 리포트</h2>
          {remaining !== null && (
            <span className="text-xs text-white/40">잔여 크레딧 {remaining}개</span>
          )}
        </div>

        {SECTIONS.map(({ key, icon, label }) => (
          <div key={key} className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span>{icon}</span>
              <span className="text-sm font-medium text-white/80">{label}</span>
            </div>
            <p className="text-sm text-white/65 leading-relaxed">
              {content[key as keyof Pick<DetailContent, 'wealth' | 'love' | 'career' | 'health'>]}
            </p>
          </div>
        ))}

        <div className="border-t border-white/10 pt-4">
          <div className="text-xs text-white/40 mb-2">행운 키워드</div>
          <div className="flex gap-2 flex-wrap">
            {content.luckyKeywords.map(kw => (
              <Badge key={kw} className="text-xs" style={{ backgroundColor: content.luckyColor + '25', borderColor: content.luckyColor + '50', color: content.luckyColor }}>
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="bg-white/5 border border-red-500/30 rounded-2xl p-6 text-center space-y-4">
        <p className="text-red-400 font-medium">{errorMsg}</p>
        {errorMsg.includes('부족') && (
          <>
            <p className="text-sm text-white/50">잔여 크레딧: {remaining}개</p>
            <a href="/credits">
              <Button className="bg-indigo-600 hover:bg-indigo-500">크레딧 충전하기</Button>
            </a>
          </>
        )}
        {!errorMsg.includes('부족') && (
          <Button onClick={() => setState('locked')} variant="outline" className="border-white/20 text-white">
            다시 시도
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative bg-white/5 border border-indigo-500/30 rounded-2xl p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90 z-10" />
      <h2 className="text-sm text-white/50 font-medium mb-3">상세 해석 리포트</h2>
      <div className="space-y-2 blur-sm select-none pointer-events-none">
        <p className="text-white/70">💰 재물운: 이 시기는 금전적으로 안정적인 흐름이...</p>
        <p className="text-white/70">💕 애정운: 인연의 실마리가 보이는 시기로...</p>
        <p className="text-white/70">💼 직업운: 새로운 기회가 찾아올 가능성이...</p>
        <p className="text-white/70">🌿 건강운: 몸의 균형을 맞추는 것이 중요한...</p>
      </div>
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
        <div className="text-center">
          <p className="font-semibold mb-1">상세 해석 보기</p>
          <p className="text-sm text-white/50 mb-4">재물·애정·직업·건강 운세 전체 분석</p>
        </div>
        <Button
          onClick={handleUnlock}
          disabled={state === 'loading'}
          className="bg-indigo-600 hover:bg-indigo-500 px-8"
        >
          {state === 'loading' ? '처리 중...' : '크레딧 1개로 열기'}
        </Button>
        <p className="text-xs text-white/30">가입 시 무료 크레딧 3개 지급</p>
      </div>
    </div>
  );
}