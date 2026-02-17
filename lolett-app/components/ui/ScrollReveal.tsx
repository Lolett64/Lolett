'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

type Variant = 'up' | 'left' | 'right' | 'scale';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: Variant;
  stagger?: boolean;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

const variantClass: Record<Variant, string> = {
  up: 'scroll-reveal',
  left: 'scroll-reveal-left',
  right: 'scroll-reveal-right',
  scale: 'scroll-reveal-scale',
};

export function ScrollReveal({
  children,
  variant = 'up',
  stagger = false,
  className = '',
  as: Tag = 'div',
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal();

  const base = stagger ? 'scroll-reveal-stagger' : variantClass[variant];
  const visible = isVisible ? 'is-visible' : '';

  return (
    // @ts-expect-error -- dynamic tag with ref
    <Tag ref={ref} className={`${base} ${visible} ${className}`}>
      {children}
    </Tag>
  );
}
