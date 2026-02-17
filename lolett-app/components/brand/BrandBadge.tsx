import { cn } from '@/lib/utils';

interface BrandBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'new' | 'lowStock';
  className?: string;
}

export function BrandBadge({ children, variant = 'primary', className }: BrandBadgeProps) {
  const variantClasses = {
    primary: 'bg-lolett-blue text-white',
    accent: 'bg-lolett-yellow text-lolett-gray-900',
    new: 'bg-lolett-blue text-white',
    lowStock: 'bg-orange-500 text-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wider uppercase',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
