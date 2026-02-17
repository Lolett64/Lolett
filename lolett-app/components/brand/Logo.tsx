import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, variant = 'default', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const colorClasses = {
    default: 'text-lolett-blue',
    white: 'text-white',
  };

  return (
    <div
      className={cn(
        'font-display font-bold tracking-tight',
        sizeClasses[size],
        colorClasses[variant],
        className
      )}
    >
      <span className="relative">
        LOLETT
        <span className="bg-lolett-yellow absolute -top-1 -right-2 h-1.5 w-1.5 rounded-full" />
      </span>
    </div>
  );
}
