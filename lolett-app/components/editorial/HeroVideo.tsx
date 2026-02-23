'use client';

import { useState } from 'react';

export function HeroVideo() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="absolute inset-0 z-0"
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 2.5s ease' }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setLoaded(true)}
        className="w-full h-full object-cover"
        style={{ filter: 'brightness(0.55) contrast(1.1) saturate(0.85)' }}
      >
        <source src="/videos/hero-beach.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
