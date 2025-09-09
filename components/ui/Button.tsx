import React from 'react';
import { Link } from 'react-router-dom';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
  variant: ButtonVariant;
  to?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant, to, href, onClick, className, disabled, type, children }) => {
  const handleClick = useSmoothScroll();
  const baseClasses =
    'font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 inline-block text-center';
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-amber-400 text-gray-900 hover:bg-amber-500',
    secondary: 'bg-white text-gray-900 hover:bg-gray-200 shadow-sm',
  };
  const classes = `${baseClasses} ${variants[variant]} ${className || ''}`.trim();

  if (to) {
    return (
      <Link to={to} onClick={(e) => onClick?.(e)} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} onClick={(e) => { handleClick(e, href); onClick?.(e); }} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button 
      onClick={(e) => onClick?.(e)} 
      className={classes} 
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
};
