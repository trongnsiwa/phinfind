import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, children, hoverable = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-2xl border border-phin-100 shadow-card transition-all duration-200 overflow-hidden',
        hoverable && 'hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
