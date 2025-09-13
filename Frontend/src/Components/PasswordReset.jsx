import { useState } from "react";
import { motion } from "framer-motion";

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${apiBaseUrl}/password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Error sending reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1e293b] p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-purple-400 mb-6">Reset Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg text-white font-semibold transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        
        {message && (
          <p className="mt-4 text-center text-green-400">{message}</p>
        )}
      </motion.div>
    </div>
  );
};

export default PasswordReset;