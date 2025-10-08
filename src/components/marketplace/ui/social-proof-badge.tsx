
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users , Eye, TrendingUp } from 'lucide-react';


interface SocialProofBadgeProps {
  type: 'views' | 'activity' | 'trending';
  count?: number;
  message?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const SocialProofBadge: React.FC<SocialProofBadgeProps> = ({
  type,
  count,
  message,
  variant = 'secondary'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'views':
        return <Eye className="h-3 w-3 mr-1" />;
      case 'activity':
        return <Users className="h-3 w-3 mr-1" />;
      case 'trending':
        return <TrendingUp className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getText = () => {
    if (message) return message;
    
    switch (type) {
      case 'views':
        return count ? `${count} views today` : 'Recently viewed';
      case 'activity':
        return count ? `${count} watching` : 'Popular';
      case 'trending':
        return 'Trending';
      default:
        return '';
    }
  };

  const getBadgeClass = () => {
    const baseClass = 'flex items-center animate-fade-in';
    
    switch (type) {
      case 'views':
        return `${baseClass} bg-blue-100 text-blue-700 hover:bg-blue-200`;
      case 'activity':
        return `${baseClass} bg-green-100 text-green-700 hover:bg-green-200`;
      case 'trending':
        return `${baseClass} bg-orange-100 text-orange-700 hover:bg-orange-200`;
      default:
        return baseClass;
    }
  };

  if (!getText()) return null;

  return (
    <Badge 
      variant={variant}
      className={getBadgeClass()}
    >
      {getIcon()}
      <span className="text-xs font-medium">{getText()}</span>
    </Badge>
  );
};
