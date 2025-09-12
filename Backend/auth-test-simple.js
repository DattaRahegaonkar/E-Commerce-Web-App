/**
 * Simple Authentication Test Script
 * 
 * This script tests the authentication endpoints without requiring any external dependencies.
 * 
 * Usage: node auth-test-simple.js
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Base URL for API
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Test user data with timestamp to avoid email conflicts
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'testpassword123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

// Print section header
function printHeader(title) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(50));
  console.log(' ' + title);
  console.log('='.repeat(50) + colors.reset + '\n');
}

// Make an HTTP request
function makeRequest(urlString, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const isHttps = url.protocol === 'https:';
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = (isHttps ? https : http).request(requestOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        let parsedData;
        try {
          parsedData = JSON.parse(responseData);
        } catch (e) {
          parsedData = responseData;
        }
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsedData
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run tests
async function runTests() {
  printHeader('AUTHENTICATION TEST SCRIPT');
  console.log(`Testing against API at: ${API_URL}`);
  console.log(`Test user email: ${testUser.email}`);
  
  let cookies = '';
  
  try {
    // 1. Test Signup
    printHeader('TESTING SIGNUP');
    
    console.log(`Creating test user: ${testUser.email}`);
    
    const signupResponse = await makeRequest(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testUser);
    
    console.log(`Status: ${signupResponse.status}`);
    console.log('Response:', signupResponse.data);
    
    if (signupResponse.status === 201) {
      console.log(colors.green + 'Signup successful!' + colors.reset);
      
      // Store cookies if any
      if (signupResponse.headers['set-cookie']) {
        cookies = signupResponse.headers['set-cookie'];
        console.log(colors.green + 'Authentication cookies received' + colors.reset);
      }
    } else if (signupResponse.status === 400 && signupResponse.data.message && signupResponse.data.message.includes('already registered')) {
      console.log(colors.yellow + 'User already exists, proceeding to login...' + colors.reset);
    } else {
      console.log(colors.red + 'Signup failed' + colors.reset);
    }
    
    // 2. Test Login
    printHeader('TESTING LOGIN');
    
    console.log(`Logging in as: ${testUser.email}`);
    
    const loginResponse = await makeRequest(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log(`Status: ${loginResponse.status}`);
    console.log('Response:', loginResponse.data);
    
    if (loginResponse.status === 200) {
      console.log(colors.green + 'Login successful!' + colors.reset);
      
      // Store cookies if any
      if (loginResponse.headers['set-cookie']) {
        cookies = loginResponse.headers['set-cookie'];
        console.log(colors.green + 'Authentication cookies received' + colors.reset);
      }
    } else {
      console.log(colors.red + 'Login failed' + colors.reset);
    }
    
    // 3. Test Protected Route
    if (cookies) {
      printHeader('TESTING PROTECTED ROUTE');
      
      console.log('Attempting to access a protected route (add product)...');
      
      const testProduct = {
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics',
        company: 'Test Company'
      };
      
      const protectedResponse = await makeRequest(`${API_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        }
      }, testProduct);
      
      console.log(`Status: ${protectedResponse.status}`);
      console.log('Response:', protectedResponse.data);
      
      if (protectedResponse.status === 201) {
        console.log(colors.green + 'Protected route access successful!' + colors.reset);
      } else {
        console.log(colors.red + 'Protected route access failed' + colors.reset);
      }
    }
    
  } catch (error) {
    console.error(colors.red + 'Test error:' + colors.reset, error);
  }
  
  console.log('\n' + colors.bright + 'Tests completed' + colors.reset);
}

// Run the tests
runTests();