// Fallback to localhost if environment variable is not set
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('API Base URL:', apiBaseUrl); // For debugging

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
      console.log(`Deleting product with ID: ${productId}`);
      const response = await fetch(`${apiBaseUrl}/delete/${productId}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          'Accept': 'application/json'
        },
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
      const response = await fetch(`${apiBaseUrl}/search/${searchTerm}`);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
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
          className="relative"
        >
          <input
            type="text"
            placeholder="Search products..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-3 bg-[#1e293b] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
          />
        </motion.div>

        {/* Product List */}
        <div className="space-y-4">
          {all.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-[#1e293b] rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex justify-between items-center"
            >
              <div>
                <p className="text-xl font-semibold text-purple-400">
                  {product.name}
                </p>
                <p className="text-gray-300 mt-1">&#8377; {product.price}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {product.category}
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(product._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Product;
