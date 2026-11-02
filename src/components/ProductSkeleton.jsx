import React from 'react';

/**
 * ProductSkeleton component provides clean shimmer placeholders during search,
 * category filtering, and data query operations.
 * @param {Object} props
 * @param {string} [props.viewMode="list"] - "list" for catalog row or "grid" for compact card
 * @param {number} [props.count=3] - Number of skeleton cards to render
 */
export default function ProductSkeleton({ viewMode = 'list', count = 3 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {items.map((i) => (
          <div
            key={i}
            className="bg-white border border-brand-gray-200 rounded-lg p-4 flex flex-col justify-between h-[380px]"
          >
            <div>
              {/* Image Skeleton */}
              <div className="w-full h-40 shimmer rounded-md mb-3" />
              {/* Category pill */}
              <div className="w-20 h-4 shimmer rounded mb-2" />
              {/* Product Title */}
              <div className="w-full h-5 shimmer rounded mb-1.5" />
              <div className="w-3/4 h-3.5 shimmer rounded mb-3" />
              {/* Price Row */}
              <div className="w-1/2 h-5 shimmer rounded mb-3" />
              {/* Spec lines */}
              <div className="space-y-2">
                <div className="w-full h-3 shimmer rounded" />
                <div className="w-5/6 h-3 shimmer rounded" />
              </div>
            </div>
            {/* Button */}
            <div className="w-full h-9 shimmer rounded-md mt-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((i) => (
        <div
          key={i}
          className="w-full bg-white border border-brand-gray-200 rounded-lg overflow-hidden"
        >
          {/* Header row */}
          <div className="bg-brand-gray-50 px-6 py-3.5 border-b border-brand-gray-200 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-28 h-5 shimmer rounded" />
              <div className="w-24 h-5 shimmer rounded" />
            </div>
            <div className="w-28 h-7 shimmer rounded-md" />
          </div>

          {/* Body layout */}
          <div className="p-6 flex flex-col lg:flex-row gap-6">
            {/* Left Image Area */}
            <div className="w-full lg:w-[32%] shrink-0">
              <div className="w-full h-52 shimmer rounded-lg mb-3" />
              <div className="w-full h-9 shimmer rounded-md" />
            </div>

            {/* Right Specs Area */}
            <div className="flex-1 space-y-3.5">
              <div className="w-40 h-7 shimmer rounded mb-2" />
              <div className="space-y-2.5">
                <div className="w-full h-4 shimmer rounded" />
                <div className="w-full h-4 shimmer rounded" />
                <div className="w-5/6 h-4 shimmer rounded" />
                <div className="w-4/5 h-4 shimmer rounded" />
                <div className="w-full h-4 shimmer rounded" />
              </div>
              <div className="pt-3 flex gap-3">
                <div className="w-44 h-10 shimmer rounded-md" />
                <div className="w-36 h-10 shimmer rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
