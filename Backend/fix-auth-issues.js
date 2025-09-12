/**
 * Fix Authentication Issues Script
 * 
 * This script diagnoses and fixes common authentication issues in the application
 * Run with: node fix-auth-issues.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    checkAuthSetup();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Load the User model
const User = require('./db/User');

// Check auth setup
async function checkAuthSetup() {
  try {
    console.log('\n=== Authentication Setup Diagnostic ===\n');
    
    // Check JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET is not set in .env file');
      console.log('   Recommendation: Add JWT_SECRET=some-random-string to your .env file');
    } else {
      console.log('✅ JWT_SECRET is set');
      
      if (jwtSecret === 'your-secret-key' || jwtSecret.length < 20) {
        console.log('⚠️  Your JWT_SECRET is weak or using the default value');
        console.log('   Recommendation: Use a strong random string for JWT_SECRET');
      }
    }
    
    // Check bcrypt installation
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('test', salt);
      console.log('✅ bcrypt is working correctly');
    } catch (error) {
      console.error('❌ bcrypt error:', error.message);
      console.log('   Recommendation: Reinstall bcrypt: npm uninstall bcrypt && npm install bcrypt');
    }
    
    // Check user collection
    const userCount = await User.countDocuments();
    console.log(`ℹ️  Found ${userCount} users in the database`);
    
    if (userCount > 0) {
      // Check if passwords are hashed
      const sampleUser = await User.findOne().select('+password');
      
      if (sampleUser) {
        const isHashed = sampleUser.password.length > 20 && sampleUser.password.includes('$');
        
        if (isHashed) {
          console.log('✅ User passwords are properly hashed');
        } else {
          console.log('❌ Found users with potentially unhashed passwords');
          console.log('   Recommendation: Consider resetting all passwords or manually hashing them');
        }
      }
    }
    
    // Check for required packages
    const requiredPackages = [
      'bcrypt',
      'cookie-parser',
      'jsonwebtoken',
      'express-validator'
    ];
    
    console.log('\n=== Package Dependencies ===\n');
    
    let missingPackages = [];
    
    for (const pkg of requiredPackages) {
      try {
        require(pkg);
        console.log(`✅ ${pkg} is installed`);
      } catch (error) {
        console.error(`❌ ${pkg} is not installed or has issues`);
        missingPackages.push(pkg);
      }
    }
    
    if (missingPackages.length > 0) {
      console.log(`\n⚠️  Missing packages: ${missingPackages.join(', ')}`);
      console.log(`   Run: npm install ${missingPackages.join(' ')}`);
    }
    
    console.log('\n=== CORS Setup ===\n');
    
    // Check CORS setup
    const allowedOrigins = process.env.ALLOWED_ORIGINS;
    if (!allowedOrigins) {
      console.log('⚠️  ALLOWED_ORIGINS not set in .env file');
      console.log('   This may cause CORS issues with authentication cookies');
    } else {
      console.log(`✅ ALLOWED_ORIGINS is set to: ${allowedOrigins}`);
    }
    
    // Check cookie settings
    const secureCookie = process.env.SECURE_COOKIE;
    if (secureCookie === 'true' && process.env.NODE_ENV !== 'production') {
      console.log('⚠️  SECURE_COOKIE is set to true in a non-production environment');
      console.log('   This will prevent cookies from working on non-HTTPS connections');
    }
    
    // Done
    console.log('\n=== Diagnostic Complete ===\n');
    
    console.log('Common issues and solutions:');
    console.log('1. 400 Bad Request on signup: Check email/password validation requirements');
    console.log('2. 500 Error on login: Ensure bcrypt is correctly installed and users have hashed passwords');
    console.log('3. Authentication not persisting: Check CORS settings and cookie configurations');
    
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error during diagnostic:', error);
  }
}