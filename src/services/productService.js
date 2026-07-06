import companyData from '../data/company.json';
import categoriesData from '../data/categories.json';
import productsData from '../data/products.json';

// In a real API or Supabase implementation, these would be asynchronous network requests.
// Using promises simulates this async nature, making UI transition to a backend simple later on.

/**
 * Get company info
 * @returns {Promise<Object>}
 */
export const getCompanyInfo = async () => {
  return { ...companyData };
};

/**
 * Get categories, dynamically appending the active product count to each.
 * @returns {Promise<Array>}
 */
export const getCategories = async () => {
  const counts = {};
  
  // Calculate product count per category
  productsData.forEach(product => {
    const catId = product.category;
    counts[catId] = (counts[catId] || 0) + 1;
  });

  return categoriesData.map(cat => ({
    ...cat,
    productCount: counts[cat.id] || 0
  }));
};

/**
 * Get products based on optional filters.
 * Filters support live matching on name, brand, saltComposition, category, strength, manufacturer.
 * @param {Object} [filters]
 * @param {string} [filters.category] - Category ID filter
 * @param {string} [filters.search] - Search text query
 * @returns {Promise<Array>}
 */
export const getProducts = async (filters = {}) => {
  let filtered = [...productsData];

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(p => p.category === filters.category);
  }

  // Filter by search query (live filtering across multiple fields)
  if (filters.search) {
    const query = filters.search.toLowerCase().trim();
    filtered = filtered.filter(p => 
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.saltComposition && p.saltComposition.toLowerCase().includes(query)) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(query)) ||
      (p.strength && p.strength.toLowerCase().includes(query)) ||
      (p.treatment && p.treatment.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  return filtered;
};

/**
 * Get a single product by ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export const getProductById = async (id) => {
  const product = productsData.find(p => p.id === id);
  return product ? { ...product } : null;
};
