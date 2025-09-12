const apiBaseUrl = import.meta.env.VITE_API_URL;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fill, setFill] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("user");
    if (auth) {
      navigate("/"); // Redirect if already logged in
    }
  }, []); // Runs once on mount

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setFill(true);
      return false;
    }

    try {
      let result = await fetch(`${apiBaseUrl}/login`, {
        method: "post",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        credentials: 'include' // Important for cookies to work
      });

      // try {
      //   let result = await fetch("/login", {
      //     method: "post",
      //     body: JSON.stringify({ email, password }),
      //     headers: { "Content-Type": "application/json" },
      //   });

      let NewResult = await result.json();

      if (!result.ok) {
        // Updated to use message field instead of msg
        setError(NewResult.message || NewResult.msg || "Login failed");
        return;
      }

      // The backend now returns a user object within the response
      const userData = NewResult.user || NewResult;
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1e293b] rounded-xl p-8 space-y-6 shadow-lg"
        >
          {/* Title */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold border-l-4 border-purple-500 pl-3 inline-block">
              Login
            </h1>
            <p className="text-gray-300">Sign in to continue to your account</p>
          </div>

          {/* Form */}
          <form className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                id="email"
                className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
              {fill && !email && (
                <p className="text-red-500 mt-1 text-sm">Enter the email</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                id="password"
                className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
              {fill && !password && (
                <p className="text-red-500 mt-1 text-sm">Enter the password</p>
              )}
            </div>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogin}
              className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all font-semibold"
            >
              Sign In
            </motion.button>
          </form>

          {/* Error Message */}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
