import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="text-center p-8">
        <h1 className="text-8xl font-bold text-purple-400 mb-4">404</h1>
        <h3 className="text-2xl font-semibold text-white mb-4">Page Not Found</h3>
        <p className="text-gray-400 mb-8">The page you are looking for might have been removed or is temporarily unavailable.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-300 font-semibold"
        >
          Return Home
        </button>
      </div>
    </div>
  )
}

export default NotFound
