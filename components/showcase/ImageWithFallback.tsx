import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  srcSet?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/images/ui/placeholder-project.svg',
  loading = 'lazy',
  sizes,
  srcSet
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      sizes={sizes}
      srcSet={srcSet}
      onError={handleError}
    />
  );
};
