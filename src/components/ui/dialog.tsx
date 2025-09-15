import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Dialog Component with Context7 Best Practices
// Features: Accessibility, keyboard navigation, focus management, animations

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  modal?: boolean;
  className?: string;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom';
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogCloseProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Main Dialog component
const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  modal = true,
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onOpenChange]);

  // Handle focus management
  useEffect(() => {
    if (open) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the dialog
      setTimeout(() => {
        dialogRef.current?.focus();
      }, 100);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }

      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && modal) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  const dialogContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm',
        'animate-in fade-in duration-200',
        className
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal={modal}
    >
      <div
        ref={dialogRef}
        className="relative"
        tabIndex={-1}
        role="dialog"
        aria-modal={modal}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};

// Dialog Content component
const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
  onClose,
  size = 'md',
  position = 'center',
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  const positionClasses = {
    center: 'items-center',
    top: 'items-start pt-16',
    bottom: 'items-end pb-16',
  };

  return (
    <div
      className={cn(
        'relative bg-background border border-border rounded-lg shadow-lg',
        'w-full mx-4',
        sizeClasses[size],
        positionClasses[position],
        'animate-in zoom-in-95 duration-200',
        className
      )}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Close dialog"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {children}
    </div>
  );
};

// Dialog Header component
const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)}>
      {children}
    </div>
  );
};

// Dialog Title component
const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className,
  level = 2,
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Component
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
    >
      {children}
    </Component>
  );
};

// Dialog Description component
const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
};

// Dialog Footer component
const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0', className)}>
      {children}
    </div>
  );
};

// Dialog Close component
const DialogClose: React.FC<DialogCloseProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium',
        'ring-offset-background transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'hover:bg-accent hover:text-accent-foreground',
        'h-10 px-4 py-2',
        className
      )}
    >
      {children || 'Close'}
    </button>
  );
};

// Compound component exports
const DialogTrigger: React.FC<{
  children: React.ReactNode;
  asChild?: boolean;
}> = ({ children, asChild }) => {
  return <>{children}</>;
};

const DialogPortal: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <>{children}</>;
};

const DialogOverlay: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
        className
      )}
    />
  );
};

// Export all components
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
};

// Export types
export type {
  DialogProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogCloseProps,
};
