import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * CategoryGrid component for Home page.
 * Displays circular cards with category image, name, active product count, and scale-up hover animations.
 * @param {Object} props
 * @param {Array} props.categories - Array of category objects
 */
export default function CategoryGrid({ categories }) {
  const navigate = useNavigate();

  const handleCategoryClick = (catId) => {
    // Navigate to catalog page and pass selected category state
    navigate('/catalog', { state: { selectedCategory: catId } });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="w-full">
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-y-10 gap-x-6 justify-center items-start"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            variants={itemVariants}
            onClick={() => handleCategoryClick(cat.id)}
            className="flex flex-col items-center text-center cursor-pointer group select-none"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {/* Circular Image Container */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-brand-gray-200 group-hover:border-brand-red-500 shadow-md group-hover:shadow-lg bg-white flex items-center justify-center p-1.5 transition-all duration-300 relative">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-550 ease-out"
                loading="lazy"
              />
              {/* Subtle hover overlay glow */}
              <div className="absolute inset-0 bg-brand-red-500/0 group-hover:bg-brand-red-500/5 transition-all duration-300 rounded-full"></div>
            </div>

            {/* Category Name */}
            <h4 className="text-sm font-bold text-brand-gray-900 mt-4 group-hover:text-brand-red-500 transition-colors line-clamp-2 px-1">
              {cat.name}
            </h4>

            {/* Product Count Badge */}
            <span className="text-[10px] font-bold text-brand-gray-700 uppercase tracking-wider mt-1 bg-brand-gray-100 group-hover:bg-brand-red-50 group-hover:text-brand-red-600 px-2 py-0.5 rounded-full transition-all">
              {cat.productCount} {cat.productCount === 1 ? 'Product' : 'Products'}
            </span>

          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
