'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

const carouselImages = [
  { src: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600&q=80', alt: 'Coastline' },
  { src: '/images/chemise-lin-mediterranee.png', alt: 'Chemise lin' },
  { src: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80', alt: 'Beach' },
  { src: '/images/robe-midi-provencale.png', alt: 'Robe provencale' },
  { src: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=600&q=80', alt: 'Provence' },
  { src: '/images/polo-pique-riviera.png', alt: 'Polo riviera' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80', alt: 'Olive trees' },
  { src: '/images/foulard-soie-mimosa.jpg', alt: 'Foulard soie' },
];

export function DragCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onMouseMove={onMouseMove}
      style={{
        display: 'flex', gap: 20, overflowX: 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
        padding: '0 clamp(24px, 5vw, 80px) 20px',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      }}
    >
      {carouselImages.map((img, i) => (
        <div key={i} style={{ flex: '0 0 auto', width: 'clamp(260px, 30vw, 380px)', aspectRatio: '3/4', position: 'relative', borderRadius: 8, overflow: 'hidden', userSelect: 'none' }}>
          <Image src={img.src} alt={img.alt} fill style={{ objectFit: 'cover', pointerEvents: 'none' }} draggable={false} />
        </div>
      ))}
    </div>
  );
}
