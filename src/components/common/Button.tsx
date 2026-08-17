import React from 'react';
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'destructive' | 'default' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'default';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    // Map legacy variants to shadcn UI variants
    const mappedVariant =
      variant === 'primary' ? 'default' :
      variant === 'danger' ? 'destructive' :
      (variant as ShadcnButtonProps['variant']) || 'default';

    const mappedSize =
      size === 'md' ? 'default' :
      (size as ShadcnButtonProps['size']) || 'default';

    return (
      <ShadcnButton
        ref={ref}
        disabled={disabled || isLoading}
        variant={mappedVariant}
        size={mappedSize}
        className={cn(className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </ShadcnButton>
    );
  }
);

Button.displayName = 'Button';

