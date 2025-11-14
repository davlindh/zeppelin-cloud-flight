import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MobileMenuItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

const itemVariants = {
  closed: {
    x: 20,
    opacity: 0
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'tween' as const,
      duration: 0.3,
      ease: 'easeOut' as const
    }
  },
  exit: {
    x: 20,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 py-3 px-6 text-lg hover:bg-gray-50 transition-colors min-h-[48px] ${
    isActive ? 'text-amber-500 font-semibold bg-amber-50' : 'text-gray-700'
  }`;

export const MobileMenuItem: React.FC<MobileMenuItemProps> = ({
  to,
  icon,
  label,
  onClick,
  className
}) => {
  return (
    <motion.div variants={itemVariants}>
      <NavLink
        to={to}
        className={mobileNavLinkClasses}
        onClick={onClick}
      >
        {icon}
        {label}
      </NavLink>
    </motion.div>
  );
};
