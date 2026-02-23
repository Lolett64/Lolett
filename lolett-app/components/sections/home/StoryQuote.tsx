'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

interface StoryQuoteProps {
  quote: string;
  author?: string;
  className?: string;
}

export function StoryQuote({ quote, author, className }: StoryQuoteProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      className={className}
      style={{
        background: '#1a1510',
        position: 'relative',
        overflow: 'hidden',
        padding: '5rem 0',
      }}
    >
      {/* Grain texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        style={{
          maxWidth: '56rem',
          margin: '0 auto',
          padding: '0 1rem',
          textAlign: 'center',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 0.8s cubic-bezier(0.33,1,0.68,1), transform 0.8s cubic-bezier(0.33,1,0.68,1)',
          position: 'relative',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)',
            lineHeight: 1.6,
            fontStyle: 'italic',
            color: '#fefcf8',
            whiteSpace: 'pre-line',
            margin: 0,
          }}
        >
          &ldquo;{quote}&rdquo;
        </p>
        {author && (
          <footer style={{ marginTop: '1.5rem' }}>
            <cite
              style={{
                fontStyle: 'normal',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#1B0B94',
              }}
            >
              — {author}
            </cite>
          </footer>
        )}
      </div>
    </section>
  );
}
