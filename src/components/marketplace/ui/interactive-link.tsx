
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface InteractiveLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'button' | 'card';
}

export const InteractiveLink: React.FC<InteractiveLinkProps> = ({
  to,
  children,
  className,
  variant = 'default'
}) => {
  const baseClasses = 'transition-all duration-300 focus-ring';
  
  const variantClasses = {
    default: 'text-blue-600 hover:text-blue-700 hover:underline',
    button: 'btn-primary hover:bg-blue-700 px-4 py-2 rounded-md inline-flex items-center justify-center',
    card: 'block hover-lift group'
  };

  return (
    <Link 
      to={to} 
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {children}
    </Link>
  );
};
