/**
 * Startup script for the backend server
 * Checks dependencies, verifies configuration, and starts the server
 * 
 * Usage: node start.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('====================================');
console.log('Startup Script for Signup-Login App');
console.log('====================================\n');

// Check for node_modules directory
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('⚠️ node_modules directory not found. Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully.');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ node_modules directory exists.');
}

// Check .env file
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('⚠️ .env file not found. Creating a basic one...');
  const envContent = `# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/userdb

# JWT Secret for authentication
JWT_SECRET=your-secret-key-change-this-in-production

# Environment
NODE_ENV=development
`;

  try {
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('✅ Basic .env file created.');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
} else {
  console.log('✅ .env file exists.');
}

// Run the dependency checker
console.log('\nChecking dependencies...');
try {
  require('./check-dependencies');
} catch (error) {
  console.error('❌ Error running dependency checker:', error.message);
}

// Start the server
console.log('\nStarting the server...');
try {
  require('./index');
  console.log('\n🚀 Server should now be running!');
  console.log('\nCommon issues and solutions:');
  console.log('1. 500 Internal Server Error: Ensure all dependencies are installed correctly.');
  console.log('2. Database connection issues: Check your MongoDB connection string in .env file.');
  console.log('3. Authentication errors: Make sure JWT_SECRET is set in .env file.');
  console.log('\nTo stop the server, press Ctrl+C');
} catch (error) {
  console.error('\n❌ Error starting server:', error.message);
  console.error('\nStacktrace:', error.stack);
  process.exit(1);
}