import React from 'react';
import { cn } from '@/lib/utils';

interface RegistrationStepLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const RegistrationStepLayout: React.FC<RegistrationStepLayoutProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

interface FieldGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  title,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-4 border-t pt-4', className)}>
      {title && (
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      )}
      {children}
    </div>
  );
};
