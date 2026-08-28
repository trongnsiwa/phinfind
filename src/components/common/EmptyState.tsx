import React from 'react';
import { LucideIcon, Coffee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyIllustration, IllustrationType } from '@/components/common/EmptyIllustration';

interface EmptyStateProps {
  illustration?: IllustrationType;
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  illustration,
  icon: Icon = Coffee,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={`p-8 text-center bg-card border border-border/60 shadow-sm rounded-2xl ${className || ''}`}>
      <CardContent className="p-0 flex flex-col items-center justify-center space-y-4">
        {illustration ? (
          <EmptyIllustration type={illustration} size={150} />
        ) : (
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-amber-gold">
            <Icon className="h-8 w-8 stroke-[1.75]" />
          </div>
        )}


        <div className="space-y-1.5 max-w-sm">
          <h3 className="font-sans font-bold text-lg text-phin-900">{title}</h3>
          <p className="text-xs text-phin-600 leading-relaxed">{description}</p>
        </div>

        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="mt-2 bg-phin-800 text-white hover:bg-phin-900"
            size="sm"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
