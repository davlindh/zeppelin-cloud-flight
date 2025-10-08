import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Eye, Star } from 'lucide-react';

interface SocialProofItem {
  id: string;
  type: 'purchase' | 'review' | 'viewing';
  message: string;
  timestamp: Date;
  location?: string;
}

interface SocialProofNotificationsProps {
  className?: string;
}

export const SocialProofNotifications: React.FC<SocialProofNotificationsProps> = ({
  className = ''
}) => {
  const [notifications, setNotifications] = useState<SocialProofItem[]>([]);
  const [currentNotification, setCurrentNotification] = useState<SocialProofItem | null>(null);

  // Mock data for demo - in real app this would come from API
  const mockNotifications: SocialProofItem[] = [
    {
      id: '1',
      type: 'purchase',
      message: 'Sarah from New York just purchased "Premium Wireless Headphones"',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      location: 'New York'
    },
    {
      id: '2',
      type: 'review',
      message: 'Mike left a 5-star review for "Smart Fitness Tracker"',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '3',
      type: 'viewing',
      message: '12 people are currently viewing "Luxury Leather Wallet"',
      timestamp: new Date(Date.now() - 1 * 60 * 1000)
    },
    {
      id: '4',
      type: 'purchase',
      message: 'Emma from California just bought "Designer Sunglasses"',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      location: 'California'
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    if (notifications.length === 0) return;

    const showNextNotification = () => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      setCurrentNotification(randomNotification || null);

      // Auto hide after 4 seconds
      setTimeout(() => {
        setCurrentNotification(null);
      }, 4000);
    };

    // Show first notification after 3 seconds
    const initialTimer = setTimeout(showNextNotification, 3000);

    // Then show notifications every 8-12 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to show
        showNextNotification();
      }
    }, Math.random() * 4000 + 8000); // 8-12 seconds

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [notifications]);

  const getIcon = (type: SocialProofItem['type']) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
      case 'viewing':
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60));
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  if (!currentNotification) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-50 max-w-sm ${className}`}>
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4 animate-slide-in-left">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getIcon(currentNotification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-900 leading-relaxed">
              {currentNotification.message}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {getTimeAgo(currentNotification.timestamp)}
            </p>
          </div>
          <button
            onClick={() => setCurrentNotification(null)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
