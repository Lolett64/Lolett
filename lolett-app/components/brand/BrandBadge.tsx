import { cn } from '@/lib/utils';

interface BrandBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'new' | 'sale' | 'lowStock' | 'soldOut';
  className?: string;
}

export function BrandBadge({ children, variant = 'primary', className }: BrandBadgeProps) {
  const variantClasses = {
    primary: 'bg-lolett-gold text-white shadow-sm',
    accent: 'bg-lolett-yellow text-lolett-gray-900 shadow-sm',
    new: 'bg-white/90 text-lolett-gold backdrop-blur-md shadow-sm border border-white/20',
    lowStock: 'bg-red-50 text-red-600 border border-red-100',
    sale: 'bg-red-600 text-white shadow-sm',
    soldOut: 'bg-lolett-gray-900 text-white opacity-90',
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
