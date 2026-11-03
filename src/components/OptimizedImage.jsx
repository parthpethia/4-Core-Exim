import React, { useState } from 'react';
import {
  optimizeImageUrl,
  buildSrcSet,
  getPlaceholderImage
} from '../utils/imageUrl';

/**
 * Lazy, resized product image with graceful fallback.
 */
export default function OptimizedImage({
  src,
  alt = '',
  width = 400,
  sizes = '(max-width: 640px) 40vw, 220px',
  className = '',
  priority = false
}) {
  const [failed, setFailed] = useState(false);
  const safeSrc = failed || !src ? getPlaceholderImage() : src;
  const optimized = optimizeImageUrl(safeSrc, { width, quality: 70 });
  const srcSet = buildSrcSet(safeSrc, [Math.round(width * 0.6), width, Math.round(width * 1.5)]);

  return (
    <img
      src={optimized}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'low'}
      onError={() => setFailed(true)}
    />
  );
}
