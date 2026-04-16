'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toSlug } from '@/lib/saju/pillars';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const HOUR_OPTIONS = [
  { label: '모름', value: '' },
  { label: '자시 (23~01시)', value: '0' },
  { label: '축시 (01~03시)', value: '2' },
  { label: '인시 (03~05시)', value: '4' },
  { label: '묘시 (05~07시)', value: '6' },
  { label: '진시 (07~09시)', value: '8' },
  { label: '사시 (09~11시)', value: '10' },
  { label: '오시 (11~13시)', value: '12' },
  { label: '미시 (13~15시)', value: '14' },
  { label: '신시 (15~17시)', value: '16' },
  { label: '유시 (17~19시)', value: '18' },
  { label: '술시 (19~21시)', value: '20' },
  { label: '해시 (21~23시)', value: '22' },
];

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState({ year: '', month: '', day: '', hour: '', gender: 'male' });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { year, month, day, hour, gender } = form;
    if (!year || !month || !day) return;
    const slug = toSlug({
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour: hour ? parseInt(hour) : undefined,
      gender: gender as 'male' | 'female',
    });
    router.push(`/saju/${slug}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">✦ 사주명리</span>
        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
          로그인
        </Button>
      </header>

      {/* 히어로 */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-12 text-center">
        <Badge className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
          가입 시 무료 크레딧 3개 지급
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          내 사주팔자,<br />
          <span className="text-indigo-400">지금 바로</span> 확인하세요
        </h1>
        <p className="text-lg text-white/60 mb-12 max-w-md">
          생년월일시를 입력하면 사주팔자와 오행 분석을 무료로 제공합니다.
          상세 해석은 크레딧 1개로 확인하세요.
        </p>

        {/* 입력 폼 */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-white/70 text-sm mb-1 block">년도</Label>
              <Input
                type="number"
                placeholder="1990"
                min={1900}
                max={2010}
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                required
              />
            </div>
            <div>
              <Label className="text-white/70 text-sm mb-1 block">월</Label>
              <Input
                type="number"
                placeholder="5"
                min={1}
                max={12}
                value={form.month}
                onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                required
              />
            </div>
            <div>
              <Label className="text-white/70 text-sm mb-1 block">일</Label>
              <Input
                type="number"
                placeholder="15"
                min={1}
                max={31}
                value={form.day}
                onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-white/70 text-sm mb-1 block">태어난 시간 (선택)</Label>
            <select
              value={form.hour}
              onChange={e => setForm(f => ({ ...f, hour: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 text-sm"
            >
              {HOUR_OPTIONS.map(o => (
                <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            {['male', 'female'].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setForm(f => ({ ...f, gender: g }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.gender === g
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                }`}
              >
                {g === 'male' ? '남성' : '여성'}
              </button>
            ))}
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 text-base font-semibold">
            무료 사주 보기 →
          </Button>
        </form>
      </section>

      {/* 기능 소개 */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-white/90">크레딧으로 더 깊이 알아보세요</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '📜', title: '상세 해석', cost: '1 크레딧', desc: '일간 성격, 오행 균형, 직업·재물·건강 분야별 심층 분석' },
            { icon: '💑', title: '궁합 분석', cost: '2 크레딧', desc: '두 사람의 사주를 비교해 궁합 점수와 관계 포인트 제공' },
            { icon: '🤖', title: 'AI 상담', cost: '1 크레딧/건', desc: 'AI가 사주를 기반으로 궁금한 것에 직접 답변' },
          ].map(item => (
            <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{item.title}</h3>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                  {item.cost}
                </Badge>
              </div>
              <p className="text-sm text-white/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 크레딧 구매 */}
      <section className="max-w-2xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8 text-white/90">크레딧 충전</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: '체험', price: '500원', credits: 1 },
            { label: '소액', price: '990원', credits: 3 },
            { label: '기본', price: '2,000원', credits: 7 },
            { label: '구독', price: '9,900원/월', credits: 30, highlight: true },
          ].map(item => (
            <div
              key={item.label}
              className={`rounded-xl p-4 text-center border ${
                item.highlight
                  ? 'bg-indigo-600/30 border-indigo-500/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="text-xs text-white/50 mb-1">{item.label}</div>
              <div className="text-lg font-bold mb-1">{item.credits}
                <span className="text-sm font-normal text-white/60"> 크레딧</span>
              </div>
              <div className="text-sm text-indigo-300 font-medium">{item.price}</div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a href="/credits">
            <Button className="bg-indigo-600 hover:bg-indigo-500 px-10">
              크레딧 충전하기 →
            </Button>
          </a>
        </div>
      </section>
    </main>
  );
}
