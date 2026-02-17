import { cn } from '@/lib/utils';

interface BrandHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function BrandHeading({
  children,
  as: Component = 'h2',
  size = 'lg',
  className,
}: BrandHeadingProps) {
  const sizeClasses = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl lg:text-4xl',
    xl: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    '2xl': 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  };

  return (
    <Component
      className={cn(
        'font-display text-lolett-gray-900 font-semibold tracking-tight break-normal whitespace-normal',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Component>
  );
}
