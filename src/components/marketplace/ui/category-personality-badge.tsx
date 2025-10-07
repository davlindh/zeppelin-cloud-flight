import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryPersonalityBadgeProps {
  mood: string;
  className?: string;
}

const moodConfig = {
  innovative: { emoji: '⚡', color: 'bg-blue-500', label: 'Innovative' },
  trendy: { emoji: '✨', color: 'bg-pink-500', label: 'Trendy' },
  cozy: { emoji: '🏠', color: 'bg-green-500', label: 'Cozy' },
  energetic: { emoji: '💪', color: 'bg-orange-500', label: 'Energetic' },
  intellectual: { emoji: '🧠', color: 'bg-amber-500', label: 'Intellectual' },
  creative: { emoji: '🎨', color: 'bg-purple-500', label: 'Creative' },
  exclusive: { emoji: '💎', color: 'bg-indigo-500', label: 'Exclusive' },
  powerful: { emoji: '🏎️', color: 'bg-gray-500', label: 'Powerful' },
  luxury: { emoji: '👑', color: 'bg-yellow-500', label: 'Luxury' },
  timeless: { emoji: '⏳', color: 'bg-amber-600', label: 'Timeless' },
  harmonious: { emoji: '🎵', color: 'bg-violet-500', label: 'Harmonious' },
  practical: { emoji: '🔧', color: 'bg-slate-500', label: 'Practical' },
  neutral: { emoji: '📦', color: 'bg-slate-400', label: 'General' }
};

export const CategoryPersonalityBadge: React.FC<CategoryPersonalityBadgeProps> = ({ 
  mood, 
  className 
}) => {
  const config = moodConfig[mood as keyof typeof moodConfig] || moodConfig.neutral;
  
  return (
    <Badge 
      className={cn(
        "text-white text-xs font-medium px-2 py-1 gap-1",
        config.color,
        className
      )}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </Badge>
  );
};