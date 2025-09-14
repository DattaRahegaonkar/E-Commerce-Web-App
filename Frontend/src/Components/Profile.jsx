import React from "react";
import { motion } from "framer-motion";
import profilePic from "../assets/profile_pic.jpg";

const Profile = () => {
  const auth = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm sm:max-w-md bg-[#1e293b] p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-400 mb-4 sm:mb-6">
          Profile
        </h2>
        
        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <div className="w-32 h-32 mx-auto border-4 border-purple-500 rounded-full overflow-hidden flex justify-center items-center mb-4">
            <img 
              className="w-full h-full object-cover" 
              src={profilePic} 
              alt="Profile" 
            />
          </div>
          
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Update Profile Picture
            </label>
            <input 
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer" 
              type="file" 
              name="image" 
              accept="image/*"
            />
          </div>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Username</p>
            <p className="text-lg font-semibold text-purple-400">{auth.name}</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Registered Email</p>
            <p className="text-lg font-semibold text-purple-400">{auth.email}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
