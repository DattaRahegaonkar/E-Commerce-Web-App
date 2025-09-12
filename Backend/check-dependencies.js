/**
 * Script to check and install required dependencies
 * Run with: node check-dependencies.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Required packages
const requiredPackages = {
  'bcrypt': '^5.1.1',
  'cookie-parser': '^1.4.6',
  'cors': '^2.8.5',
  'dotenv': '^16.5.0',
  'express': '^4.21.2',
  'express-validator': '^7.0.1',
  'helmet': '^7.1.0',
  'jsonwebtoken': '^9.0.2',
  'mongoose': '^8.10.1',
  'morgan': '^1.10.0'
};

// Read package.json
const packageJsonPath = path.join(__dirname, 'package.json');
let packageJson;

try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  packageJson = JSON.parse(packageJsonContent);
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
}

// Check dependencies
const missingPackages = [];
const currentDependencies = packageJson.dependencies || {};

for (const [pkg, version] of Object.entries(requiredPackages)) {
  if (!currentDependencies[pkg]) {
    missingPackages.push(pkg);
  }
}

// Install missing packages
if (missingPackages.length > 0) {
  console.log(`Installing missing packages: ${missingPackages.join(', ')}`);
  
  try {
    execSync(`npm install ${missingPackages.join(' ')}`, { stdio: 'inherit' });
    console.log('All missing packages installed successfully.');
  } catch (error) {
    console.error('Error installing packages:', error.message);
    process.exit(1);
  }
} else {
  console.log('All required packages are already installed.');
}

console.log('Checking for common issues...');

// Test bcrypt
try {
  require('bcrypt');
  console.log('✅ bcrypt is working correctly');
} catch (error) {
  console.error('❌ bcrypt error:', error.message);
  console.log('Try reinstalling bcrypt: npm uninstall bcrypt && npm install bcrypt');
}

// Test jsonwebtoken
try {
  require('jsonwebtoken');
  console.log('✅ jsonwebtoken is working correctly');
} catch (error) {
  console.error('❌ jsonwebtoken error:', error.message);
}

// Test mongodb connection
try {
  const mongoose = require('mongoose');
  console.log('✅ mongoose is installed correctly');
  
  // Check if .env file exists
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    console.log('✅ .env file exists');
  } else {
    console.log('❌ .env file is missing');
  }
} catch (error) {
  console.error('❌ mongoose error:', error.message);
}

console.log('\nDependency check completed.');