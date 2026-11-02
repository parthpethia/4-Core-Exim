import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CategoryGrid component for Home page.
 * Displays clean pharmaceutical category blocks with active batch counts.
 * @param {Object} props
 * @param {Array} props.categories - Array of category objects
 */
export default function CategoryGrid({ categories }) {
  const navigate = useNavigate();

  const handleCategoryClick = (catId) => {
    navigate('/catalog', { state: { selectedCategory: catId } });
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 justify-center items-stretch">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className="flex flex-col items-center text-center cursor-pointer p-3.5 bg-white border border-brand-gray-200 rounded-lg hover:border-brand-red-600 hover:shadow-sm transition-all duration-150 group select-none"
          >
            {/* Category Image Container */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-brand-gray-200 bg-brand-gray-50 flex items-center justify-center p-1 mb-3">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover rounded-full"
                loading="lazy"
              />
            </div>

            {/* Category Name */}
            <h4 className="text-xs font-bold text-brand-gray-900 group-hover:text-brand-red-700 transition-colors line-clamp-2 leading-snug">
              {cat.name}
            </h4>

            {/* Product Count Badge */}
            <span className="text-[10px] font-mono font-semibold text-brand-gray-500 mt-2 bg-brand-gray-100 px-2 py-0.5 rounded">
              {cat.productCount} {cat.productCount === 1 ? 'Item' : 'Items'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
