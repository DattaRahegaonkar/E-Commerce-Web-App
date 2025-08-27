import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const apiBaseUrl = import.meta.env.VITE_API_URL;

const AddProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [company, setCompany] = useState("");
  const navigate = useNavigate();

  const AddProduct = async (e) => {
    e.preventDefault();

    const auth = JSON.parse(localStorage.getItem("user"));
    let userid = auth._id;

    let result = await fetch(`${apiBaseUrl}/add`, {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, price, category, company, userid }),
    });

    result = await result.json();

    // let result = await fetch("/add", {
    //   method: "post",
    //   headers: { "content-type": "application/json" },
    //   body: JSON.stringify({ name, price, category, company, userid }),
    // });

    // result = await result.json();



    setName("");
    setPrice("");
    setCategory("");
    setCompany("");

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#1e293b] p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-purple-400 mb-6">
          Add Product
        </h2>
        <form onSubmit={AddProduct} className="space-y-5">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Grocery">Grocery</option>
          </select>
          <input
            type="text"
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            required
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 transition-colors text-white font-semibold py-3 rounded-lg"
          >
            Add Product
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProduct;
