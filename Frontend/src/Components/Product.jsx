// Fallback to localhost if environment variable is not set
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Product = () => {
  const [all, setAll] = useState([]);
  const navigate = useNavigate();

  async function ShowProducts() {
    try {
      const response = await fetch(`${apiBaseUrl}/show`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include' // Add credentials to include cookies with JWT token
      });

      const result = await response.json();
      setAll(result);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  useEffect(() => {
    ShowProducts();
  }, []);

  const handleEdit = (productId) => {
    navigate(`/update/${productId}`);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/delete/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json'
        },
        credentials: 'include' // Add credentials to include cookies with JWT token
      });

      const result = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Delete failed:', {
          status: response.status,
          statusText: response.statusText,
          result
        });
        alert(`Failed to delete product: ${result.msg || 'Unknown error'}`);
        return;
      }
      
      // Refresh the product list on success
      ShowProducts();
      alert('Product deleted successfully');
      
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Error: ${error.message || 'Failed to delete product'}`);
    }
  };

  const handleSearch = async (searchTerm) => {
    if (searchTerm.trim() === "") {
      ShowProducts(); // Show all products if search is empty
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/search/${searchTerm}`, {
        credentials: 'include' // Add credentials to include cookies with JWT token
      });
      if (response.ok) {
        const result = await response.json();
        setAll(result);
      } else {
        setAll([]); // Clear results if search fails
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setAll([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-20 py-10 pt-6">
      <div className="w-full max-w-none mx-auto space-y-6">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold border-l-4 border-purple-500 pl-3"
        >
          Products
        </motion.h1>
        
        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-400 text-center"
        >
          Click the Edit button on any product to update it, or Delete to remove it
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative flex justify-center px-4"
        >
          <input
            type="text"
            placeholder="Search products..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-1/2 p-3 bg-[#1e293b] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
          />
        </motion.div>

        {/* Product Grid - Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {all.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-[#1e293b] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <div className="text-white text-4xl opacity-50">
                  📦
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {product.name}
                </h3>

                <p className="text-2xl font-bold text-green-400 mb-2">
                  &#8377; {product.price}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <span className="bg-gray-700 px-2 py-1 rounded-full text-xs">
                    {product.category}
                  </span>
                  <span className="text-xs">
                    {product.stock || 1} in stock
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  by {product.company}
                </p>

                {/* Action Buttons - Hidden by default, show on hover */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(product._id);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product._id);
                    }}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Product;
