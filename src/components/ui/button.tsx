import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'star';
  size?: 'default' | 'xs' | 'sm' | 'lg';
  isLoading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'default',
  size = 'default',
  isLoading = false,
  children,
  ...props
}) => {
  const sizeClasses: Record<Required<ButtonProps>['size'], string> = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses: Record<Required<ButtonProps>['variant'], string> = {
    default: 'bg-primary text-white hover:bg-primary/90',
    outline: 'border-2 border-white text-white hover:bg-gray-600',
    ghost: 'text-white hover:bg-slate-300',
    star: 'text-white text-primary hover:bg-slate-900',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600'
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'disabled:pointer-events-none disabled:opacity-50',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  return (
    <button
      className={baseClasses}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <span className="mr-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;