import React from 'react';

interface TagListProps {
  tags: string[];
  variant?: 'colored' | 'minimal' | 'hero';
  size?: 'sm' | 'md' | 'lg';
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  variant = 'colored',
  size = 'md'
}) => {
  if (!tags.length) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'minimal':
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
      case 'hero':
        return 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30';
      default:
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className={`
            inline-block rounded-full font-medium transition-colors duration-200
            ${sizeClasses[size]}
            ${getVariantClasses(variant)}
          `}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};
