/**
 * Authentication Testing Script
 * 
 * This script tests the entire authentication flow including signup, login,
 * and accessing protected routes. It helps diagnose any issues with the
 * authentication system.
 * 
 * Usage: node test-auth.js
 */

// Use built-in fetch API (available in Node.js v18+)
// If you're using an older version of Node.js, install node-fetch:
// npm install node-fetch
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Base URL for API
const API_URL = process.env.API_URL || 'http://localhost:3000';
let authCookies = '';

// Test user data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`, // Use timestamp to make email unique
  password: 'testpassword123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Log with color
function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

// Print section header
function printHeader(title) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(50));
  console.log(' ' + title);
  console.log('='.repeat(50) + colors.reset + '\n');
}

// Ask a question and get the answer
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Run all tests
async function runTests() {
  printHeader('AUTHENTICATION TESTING SCRIPT');
  
  log('This script will test the entire authentication flow:', colors.bright);
  log('1. Create a test user via signup');
  log('2. Log in with the test user');
  log('3. Test accessing a protected route');
  log('4. Test token validation and error handling');
  
  const startTest = await askQuestion('\nDo you want to start the tests? (y/n): ');
  
  if (startTest.toLowerCase() !== 'y') {
    log('Test aborted.', colors.yellow);
    rl.close();
    return;
  }
  
  try {
    // 1. Test signup
    await testSignup();
    
    // 2. Test login
    await testLogin();
    
    // 3. Test protected route
    await testProtectedRoute();
    
    // 4. Test authorization errors
    await testAuthErrors();
    
    log('\nAll tests completed!', colors.green + colors.bright);
  } catch (error) {
    log(`\nTest failed: ${error.message}`, colors.red);
  } finally {
    rl.close();
  }
}

// Test signup endpoint
async function testSignup() {
  printHeader('TESTING SIGNUP');
  
  log(`Creating test user: ${testUser.email}`, colors.yellow);
  
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (response.status === 201) {
      log('Signup successful!', colors.green);
      log('Response:', colors.dim);
      console.log(data);
      
      // Store cookies for later use
      if (response.headers.get('set-cookie')) {
        authCookies = response.headers.get('set-cookie');
        log('Authentication cookies received', colors.green);
      } else {
        log('No authentication cookies received', colors.yellow);
      }
      
      return data;
    } else {
      log(`Signup failed with status ${response.status}`, colors.red);
      log('Error:', colors.dim);
      console.log(data);
      
      // If user already exists, try logging in instead
      if (response.status === 400 && data.message && data.message.includes('already registered')) {
        log('User already exists. Proceeding to login...', colors.yellow);
        return null;
      }
      
      throw new Error(`Signup failed: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    log(`Request error: ${error.message}`, colors.red);
    throw error;
  }
}

// Test login endpoint
async function testLogin() {
  printHeader('TESTING LOGIN');
  
  log(`Logging in as: ${testUser.email}`, colors.yellow);
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log('Login successful!', colors.green);
      log('Response:', colors.dim);
      console.log(data);
      
      // Store cookies for later use
      if (response.headers.get('set-cookie')) {
        authCookies = response.headers.get('set-cookie');
        log('Authentication cookies received', colors.green);
      } else {
        log('No authentication cookies received', colors.yellow);
      }
      
      return data;
    } else {
      log(`Login failed with status ${response.status}`, colors.red);
      log('Error:', colors.dim);
      console.log(data);
      throw new Error(`Login failed: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    log(`Request error: ${error.message}`, colors.red);
    throw error;
  }
}

// Test accessing a protected route
async function testProtectedRoute() {
  printHeader('TESTING PROTECTED ROUTE');
  
  log('Attempting to access a protected route (add product)...', colors.yellow);
  
  // Sample product data
  const testProduct = {
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics',
    company: 'Test Company'
  };
  
  try {
    const response = await fetch(`${API_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookies
      },
      body: JSON.stringify(testProduct)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log('Protected route access successful!', colors.green);
      log('Response:', colors.dim);
      console.log(data);
      return data;
    } else {
      log(`Protected route access failed with status ${response.status}`, colors.red);
      log('Error:', colors.dim);
      console.log(data);
      throw new Error(`Protected route access failed: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    log(`Request error: ${error.message}`, colors.red);
    throw error;
  }
}

// Test authorization errors
async function testAuthErrors() {
  printHeader('TESTING AUTH ERRORS');
  
  log('Attempting to access a protected route without authentication...', colors.yellow);
  
  try {
    const response = await fetch(`${API_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Unauthorized Test Product',
        price: 99.99,
        category: 'Electronics',
        company: 'Test Company'
      })
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      log('Authentication error test passed! (Correctly received 401)', colors.green);
      log('Error message:', colors.dim);
      console.log(data);
    } else {
      log(`Unexpected status code: ${response.status} (expected 401)`, colors.red);
      log('Response:', colors.dim);
      console.log(data);
    }
  } catch (error) {
    log(`Request error: ${error.message}`, colors.red);
  }
}

// Run the tests
runTests();