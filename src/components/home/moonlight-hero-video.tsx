'use client';

import { useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

type MoonlightHeroVideoProps = {
  className?: string;
};

export function MoonlightHeroVideo({ className }: MoonlightHeroVideoProps) {
  const [ended, setEnded] = useState(false);

  return (
    <div className={cn('moon-hero-media', className)} aria-hidden>
      <Image
        src="/images/moonlight-teacher-hero-poster.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="moon-hero-poster"
      />
      <video
        className={cn('moon-hero-video', ended && 'opacity-0')}
        autoPlay
        muted
        playsInline
        preload="metadata"
        poster="/images/moonlight-teacher-hero-poster.jpg"
        disablePictureInPicture
        onEnded={() => setEnded(true)}
        onError={() => setEnded(true)}
      >
        <source src="/videos/moonlight-teacher-hero.webm" type="video/webm" />
        <source src="/videos/moonlight-teacher-hero.mp4" type="video/mp4" />
      </video>
      <div className="moon-hero-media-overlay" />
    </div>
  );
}
