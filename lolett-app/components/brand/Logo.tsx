import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: 32,
    md: 44,
    lg: 60,
  };

  const h = sizeMap[size];

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
