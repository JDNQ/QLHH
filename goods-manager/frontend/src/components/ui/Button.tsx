'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-600 active:scale-[0.98] shadow-sm',
        secondary: 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100',
        ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
        danger: 'bg-danger text-white hover:bg-red-700 shadow-sm',
        success: 'bg-success text-white hover:bg-green-700 shadow-sm',
        outline: 'border border-primary text-primary hover:bg-orange-50',
        link: 'text-primary hover:underline p-0 h-auto',
      },
      size: {
        sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
        md: 'text-sm px-4 py-2 h-10',
        lg: 'text-base px-6 py-3 h-12',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon ?? null}
      {children}
      {!isLoading && rightIcon}
    </button>
  ),
);
Button.displayName = 'Button';
