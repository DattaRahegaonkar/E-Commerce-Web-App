// Backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Use environment variable or fallback to default (only for development)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for the given user ID
 * @param {string} userId - The ID of the user
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Middleware to authenticate JWT token
 * Checks for token in cookies or Authorization header
 */
const authenticateToken = (req, res, next) => {
  // For debugging token issues
  const debugMode = process.env.NODE_ENV === 'development';
  
  if (debugMode) {
    console.log('Auth debug - Cookies:', req.cookies);
    console.log('Auth debug - Authorization header:', req.headers.authorization);
  }
  
  // Get token from cookie or authorization header
  let token = null;
  
  // First try cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    if (debugMode) console.log('Auth debug - Found token in cookies');
  }
  // Then try header
  else if (req.headers.authorization) {
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    const parts = authHeader.split(' ');
    
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
      if (debugMode) console.log('Auth debug - Found token in Authorization header');
    }
  }
  
  // No token found
  if (!token) {
    if (debugMode) console.log('Auth debug - No token found');
    return res.status(401).json({
      message: 'Access denied. Please log in to continue.',
      details: 'No authentication token found in request'
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    if (debugMode) console.log('Auth debug - Token verified successfully for user:', decoded.id);
    
    next();
  } catch (error) {
    if (debugMode) console.error('Auth debug - Token verification failed:', error.message);
    
    // Different messages for different errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }
    
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

module.exports = { generateToken, authenticateToken };