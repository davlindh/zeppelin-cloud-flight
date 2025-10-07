
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, Package, Tag } from 'lucide-react';
import { CategoryPersonalityBadge } from './category-personality-badge';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  mood?: string;
  categoryType?: boolean;
}

interface EnhancedBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const EnhancedBreadcrumb: React.FC<EnhancedBreadcrumbProps> = ({
  items,
  className = '
}) => {
  const getDefaultIcon = (index: number) => {
    if (index === 0) return <Home className="h-4 w-4" />;
    if (index === 1) return <Package className="h-4 w-4" />;
    return <Tag className="h-4 w-4" />;
  };

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
          )}
          <Link
            to={item.href}
            className={`flex items-center gap-1.5 transition-colors hover:text-blue-600 ${
              index === items.length - 1
                ? 'text-slate-900 font-medium pointer-events-none'
                : 'text-slate-600'
            }`}
          >
            {item.icon || getDefaultIcon(index)}
            <span className="truncate">{item.label}</span>
            {item.categoryType && item.mood && (
              <CategoryPersonalityBadge mood={item.mood} className="ml-2" />
            )}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};
