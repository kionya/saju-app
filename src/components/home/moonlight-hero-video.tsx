import Image from 'next/image';

import { cn } from '@/lib/utils';

type MoonlightHeroVideoProps = {
  className?: string;
};

export function MoonlightHeroVideo({ className }: MoonlightHeroVideoProps) {
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
        className="moon-hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/moonlight-teacher-hero-poster.jpg"
        disablePictureInPicture
      >
        <source src="/videos/moonlight-teacher-hero.webm" type="video/webm" />
        <source src="/videos/moonlight-teacher-hero.mp4" type="video/mp4" />
      </video>
      <div className="moon-hero-media-overlay" />
    </div>
  );
}
