import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ProductSearch = ({ onResults, onLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    minPrice: "",
    maxPrice: "",
    minRating: ""
  });

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const searchProducts = async (term, currentFilters) => {
    if (!term.trim()) {
      onResults([]);
      return;
    }

    onLoading(true);
    try {
      const params = new URLSearchParams({
        ...currentFilters,
        page: 1,
        limit: 20
      });

      const response = await fetch(`${apiBaseUrl}/search/${encodeURIComponent(term)}?${params}`);
      const data = await response.json();
      
      onResults(data.products || []);
    } catch (error) {
      console.error("Search error:", error);
      onResults([]);
    } finally {
      onLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((term, currentFilters) => searchProducts(term, currentFilters), 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm, filters);
  }, [searchTerm, filters, debouncedSearch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1e293b] p-6 rounded-xl shadow-lg mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          />
        </div>
        
        <select
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          className="p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
        >
          <option value="all">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Jewelry">Jewelry</option>
          <option value="Accessories">Accessories</option>
          <option value="Footwear">Footwear</option>
        </select>
        
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
          className="p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
        />
        
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
          className="p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
        />
      </div>
    </motion.div>
  );
};

export default ProductSearch;