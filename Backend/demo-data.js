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
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  }
];

const sampleProducts = [
  // Electronics
  {
    name: 'iPhone 15 Pro Max',
    price: 1199,
    category: 'Electronics',
    company: 'Apple',
    stock: 25,
    description: 'Latest iPhone with Pro camera system and titanium design'
  },
  {
    name: 'MacBook Pro 14" M3',
    price: 1999,
    category: 'Electronics',
    company: 'Apple',
    stock: 15,
    description: 'Powerful laptop with M3 chip for professional work'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299,
    category: 'Electronics',
    company: 'Samsung',
    stock: 30,
    description: 'Premium Android smartphone with S Pen and advanced camera'
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    price: 349,
    category: 'Electronics',
    company: 'Sony',
    stock: 45,
    description: 'Industry-leading noise canceling wireless headphones'
  },
  {
    name: 'iPad Pro 12.9"',
    price: 1099,
    category: 'Electronics',
    company: 'Apple',
    stock: 20,
    description: 'Professional tablet with M2 chip and Apple Pencil support'
  },

  // Clothing & Fashion
  {
    name: 'Nike Air Max 270',
    price: 129,
    category: 'Clothing',
    company: 'Nike',
    stock: 80,
    description: 'Comfortable running shoes with Air Max cushioning'
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    price: 89,
    category: 'Clothing',
    company: 'Levi\'s',
    stock: 60,
    description: 'Classic straight fit jeans, the original since 1873'
  },
  {
    name: 'Adidas Ultraboost 23',
    price: 189,
    category: 'Clothing',
    company: 'Adidas',
    stock: 40,
    description: 'High-performance running shoes with Boost technology'
  },
  {
    name: 'H&M Cotton T-Shirt',
    price: 19,
    category: 'Clothing',
    company: 'H&M',
    stock: 150,
    description: 'Soft cotton t-shirt, perfect for everyday wear'
  },

  // Books
  {
    name: 'The Great Gatsby',
    price: 12,
    category: 'Books',
    company: 'Penguin Books',
    stock: 100,
    description: 'Classic American novel by F. Scott Fitzgerald'
  },
  {
    name: 'Atomic Habits',
    price: 16,
    category: 'Books',
    company: 'Avery',
    stock: 75,
    description: 'Transform your life with tiny changes in behavior'
  },
  {
    name: 'Dune',
    price: 18,
    category: 'Books',
    company: 'Ace Books',
    stock: 50,
    description: 'Epic science fiction novel by Frank Herbert'
  },

  // Home & Kitchen
  {
    name: 'Dyson V15 Detect Vacuum',
    price: 699,
    category: 'Home',
    company: 'Dyson',
    stock: 12,
    description: 'Powerful cordless vacuum with laser dust detection'
  },
  {
    name: 'KitchenAid Stand Mixer',
    price: 379,
    category: 'Home',
    company: 'KitchenAid',
    stock: 8,
    description: 'Professional 5-quart stand mixer for baking enthusiasts'
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    price: 89,
    category: 'Home',
    company: 'Instant Pot',
    stock: 25,
    description: 'Multi-cooker that replaces 7 kitchen appliances'
  },

  // Sports & Outdoors
  {
    name: 'Peloton Bike',
    price: 2495,
    category: 'Sports',
    company: 'Peloton',
    stock: 5,
    description: 'Interactive exercise bike with live and on-demand classes'
  },
  {
    name: 'Yoga Mat Premium',
    price: 49,
    category: 'Sports',
    company: 'Manduka',
    stock: 35,
    description: 'Non-slip yoga mat with superior cushioning'
  },

  // Beauty & Personal Care
  {
    name: 'Dyson Airwrap Complete',
    price: 599,
    category: 'Beauty',
    company: 'Dyson',
    stock: 10,
    description: 'Multi-styling tool for curls, waves, and smoothing'
  },
  {
    name: 'The Ordinary Hyaluronic Acid',
    price: 7,
    category: 'Beauty',
    company: 'The Ordinary',
    stock: 200,
    description: 'Hydrating serum with hyaluronic acid for all skin types'
  }
];

async function createUsers() {
  // console.log('Creating sample users...');

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
        password: hashedPassword
      });

      // Set role if provided
      if (userData.role) {
        user.role = userData.role;
      }

      await user.save();
      // console.log(`✅ Created user: ${userData.email}`);
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
    // console.log('✅ Cleared sample users');

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
    console.log('✅ Connected to MongoDB for demo data');

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
    console.log('\n🛒 Total products created: 20 across 6 categories');

    console.log('Create New Account of user and admin to check the functionality !');

  } catch (error) {
    console.error('❌ Demo data error:', error.message);
    process.exit(1);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
    } catch (closeError) {
      console.error('❌ Error closing database connection:', closeError.message);
    }
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