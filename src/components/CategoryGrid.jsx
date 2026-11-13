import React from 'react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

/**
 * CategoryGrid — home therapeutic segment index.
 */
export default function CategoryGrid({ categories }) {
  const navigate = useNavigate();

  const handleCategoryClick = (catId) => {
    navigate('/catalog', { state: { selectedCategory: catId } });
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 justify-center items-stretch">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className="flex flex-col items-center text-center cursor-pointer p-3 bg-transparent hover:bg-brand-gray-50 rounded-md transition-colors duration-150 group select-none border border-transparent hover:border-brand-gray-200"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-brand-gray-100 flex items-center justify-center mb-2.5 ring-1 ring-brand-gray-200/80 group-hover:ring-brand-red-200 transition-shadow">
              <OptimizedImage
                src={cat.image}
                alt={cat.name}
                width={128}
                sizes="64px"
                className="w-full h-full object-cover"
              />
            </div>

            <h4 className="text-xs font-semibold text-brand-gray-800 group-hover:text-brand-red-700 transition-colors line-clamp-2 leading-snug">
              {cat.name}
            </h4>

            <span className="text-[10px] font-mono text-brand-gray-500 mt-1.5">
              {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
