import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const apiBaseUrl = import.meta.env.VITE_API_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/product/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Product not found');
        }

        const productData = await response.json();
        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/update/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Delete failed:', {
          status: response.status,
          statusText: response.statusText,
          result
        });
        alert(`Failed to delete product: ${result.message || 'Unknown error'}`);
        return;
      }

      alert('Product deleted successfully');
      navigate("/");
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Error: ${error.message || 'Failed to delete product'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl bg-[#1e293b] p-8 rounded-2xl shadow-lg text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading product details...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl bg-[#1e293b] p-8 rounded-2xl shadow-lg text-center"
        >
          <div className="text-red-400 text-xl mb-4">Error: {error}</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition"
          >
            Back to Products
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl bg-[#1e293b] p-8 rounded-2xl shadow-lg text-center"
        >
          <div className="text-gray-400 text-xl mb-4">Product not found</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition"
          >
            Back to Products
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-6">
      <div className="max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition flex items-center gap-2"
        >
          ← Back to Products
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#1e293b] rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Product Image Section */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-8xl mb-4 opacity-80">
                  📦
                </div>
                <p className="text-white text-lg opacity-75">Product Image</p>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="p-8">
              {/* Product Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-purple-400 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold text-green-400">
                    &#8377; {product.price}
                  </span>
                  <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                    {product.category}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  by <span className="text-purple-300 font-medium">{product.company}</span>
                </p>
              </div>

              {/* Stock Information */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Stock Available:</span>
                  <span className={`font-semibold ${product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {product.stock || 1} units
                  </span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-300 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Product Metadata */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Product Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Product ID:</span>
                    <p className="text-gray-300 font-mono text-xs mt-1">{product._id}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <p className="text-gray-300">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  {product.updatedAt && product.updatedAt !== product.createdAt && (
                    <div>
                      <span className="text-gray-400">Last Updated:</span>
                      <p className="text-gray-300">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition"
                >
                  Edit Product
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition"
                >
                  Delete Product
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;