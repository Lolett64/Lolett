import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, variant = 'default', size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  if (variant === 'white') {
    return (
      <span
        className={cn(
          'font-[family-name:var(--font-montserrat)] font-black tracking-[-0.02em] text-white inline-flex items-center',
          sizeMap[size],
          className
        )}
      >
        LOLET
        <span className="inline-block transform rotate-[15deg] origin-bottom-left">T</span>
      </span>
    );
  }

  const hMap = { sm: 32, md: 44, lg: 60 };
  const h = hMap[size];

  return (
    <Image
      src="/images/Logo Lolett.jpeg"
      alt="LOLETT"
      width={h * 2.5}
      height={h}
      className={cn(
        'object-contain rounded',
        className
      )}
      style={{ height: h, width: 'auto' }}
      priority
    />
  );
}
