import React from 'react'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h3 className="text-2xl font-semibold text-gray-600 mb-6">Page Not Found</h3>
        <p className="text-gray-500 mb-8">The page you are looking for might have been removed or is temporarily unavailable.</p>
        <a 
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
        >
          Return Home
        </a>
      </div>
    </div>
  )
}

export default NotFound;
