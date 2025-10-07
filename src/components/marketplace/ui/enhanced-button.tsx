
import React from 'react';
import { Button as BaseButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ButtonProps } from '@/components/ui/button';

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  ripple?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  className,
  loading = false,
  ripple = true,
  disabled,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled && !loading) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const rippleElement = document.createElement('div');
      rippleElement.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
      `;
      
      button.appendChild(rippleElement);
      
      setTimeout(() => {
        rippleElement.remove();
      }, 600);
    }
    
    if (onClick && !loading && !disabled) {
      onClick(e);
    }
  };

  return (
    <>
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
      <BaseButton
        {...props}
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          loading && 'cursor-not-allowed',
          ripple && 'active:scale-95',
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-current/10">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <span className={loading ? 'opacity-0' : 'opacity-100'}>
          {children}
        </span>
      </BaseButton>
    </>
  );
};
