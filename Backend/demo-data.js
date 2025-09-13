#!/usr/bin/env node

/**
 * Demo Data Script
 * Populates the database with sample users and products for testing
 * Run with: node demo-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./db/User');
const Product = require('./db/Product');

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123'
  }
];

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    price: 999,
    category: 'Electronics',
    company: 'Apple',
    stock: 50
  },
  {
    name: 'MacBook Pro 16"',
    price: 2499,
    category: 'Electronics',
    company: 'Apple',
    stock: 25
  },
  {
    name: 'Nike Air Max',
    price: 129,
    category: 'Clothing',
    company: 'Nike',
    stock: 100
  },
  {
    name: 'Samsung Galaxy S24',
    price: 799,
    category: 'Electronics',
    company: 'Samsung',
    stock: 75
  },
  {
    name: 'Sony WH-1000XM5',
    price: 349,
    category: 'Electronics',
    company: 'Sony',
    stock: 40
  },
  {
    name: 'The Great Gatsby',
    price: 12,
    category: 'Books',
    company: 'Penguin Books',
    stock: 200
  },
  {
    name: 'Dyson V15 Vacuum',
    price: 699,
    category: 'Home',
    company: 'Dyson',
    stock: 15
  },
  {
    name: 'Levi\'s 501 Jeans',
    price: 89,
    category: 'Clothing',
    company: 'Levi\'s',
    stock: 80
  }
];

async function createUsers() {
  console.log('Creating sample users...');

  for (const userData of sampleUsers) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user'
      });

      await user.save();
      console.log(`✅ Created user: ${userData.email}`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
    }
  }
}

async function createProducts() {
  console.log('\nCreating sample products...');

  // Get all users to assign products to them
  const users = await User.find({});
  if (users.length === 0) {
    console.log('❌ No users found. Please create users first.');
    return;
  }

  for (let i = 0; i < sampleProducts.length; i++) {
    try {
      const productData = sampleProducts[i];
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Check if product with same name already exists
      const existingProduct = await Product.findOne({ name: productData.name });
      if (existingProduct) {
        console.log(`Product ${productData.name} already exists, skipping...`);
        continue;
      }

      // Create product
      const product = new Product({
        ...productData,
        userid: randomUser._id
      });

      await product.save();
      console.log(`✅ Created product: ${productData.name} (by ${randomUser.name})`);
    } catch (error) {
      console.error(`❌ Error creating product ${productData.name}:`, error.message);
    }
  }
}

async function clearData() {
  console.log('Clearing existing demo data...');

  try {
    // Clear users created by demo script
    await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
    console.log('✅ Cleared sample users');

    // Clear products created by demo script
    await Product.deleteMany({ name: { $in: sampleProducts.map(p => p.name) } });
    console.log('✅ Cleared sample products');
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
  }
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check command line arguments
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear') || args.includes('-c');

    if (shouldClear) {
      await clearData();
    }

    // Create sample data
    await createUsers();
    await createProducts();

    console.log('\n🎉 Demo data creation completed!');
    console.log('\nSample login credentials:');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: jane@example.com / password123');
    console.log('User 3: alice@example.com / password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Handle command line usage
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Demo Data Script

Usage: node demo-data.js [options]

Options:
  --clear, -c    Clear existing demo data before creating new data
  --help, -h     Show this help message

Examples:
  node demo-data.js              # Create demo data
  node demo-data.js --clear      # Clear and recreate demo data
  `);
  process.exit(0);
}

// Run the script
main().catch(console.error);