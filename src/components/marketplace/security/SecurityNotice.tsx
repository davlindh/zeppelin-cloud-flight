import React from 'react';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityNoticeProps {
  type: 'bidding' | 'communication' | 'guest-checkout';
  className?: string;
}

export const SecurityNotice: React.FC<SecurityNoticeProps> = ({ type, className = '' }) => {
  const getNoticeContent = () => {
    switch (type) {
      case 'bidding':
        return {
          icon: Shield,
          title: 'Secure Bidding',
          description: 'Your bid information is protected with encryption and rate limiting. Email addresses are masked for privacy.',
          features: ['Rate-limited bidding', 'Input validation', 'Privacy protection']
        };
      case 'communication':
        return {
          icon: Lock,
          title: 'Secure Communication',
          description: 'All messages are validated and sanitized. Your personal information is protected.',
          features: ['Input sanitization', 'Spam prevention', 'Contact privacy']
        };
      case 'guest-checkout':
        return {
          icon: Eye,
          title: 'Guest Privacy',
          description: 'Shopping as a guest? Your data is secure and only used for order processing.',
          features: ['Secure processing', 'No tracking', 'Data protection']
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Security Notice',
          description: 'Your data is protected with industry-standard security measures.',
          features: []
        };
    }
  };

  const { icon: Icon, title, description, features } = getNoticeContent();

  return (
    <Alert className={`border-green-200 bg-green-50 ${className}`}>
      <Icon className="h-4 w-4 text-green-600" />
      <AlertDescription className="ml-2">
        <div className="flex flex-col space-y-2">
          <div>
            <strong className="text-green-800">{title}</strong>
            <p className="text-green-700 text-sm mt-1">{description}</p>
          </div>
          {features.length > 0 && (
            <ul className="text-xs text-green-600 space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};