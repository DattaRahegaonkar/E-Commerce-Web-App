#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./db/User');
const Product = require('./db/Product');

const users = [
  { name: 'Admin User',  email: 'admin@demo.com',    password: 'Admin@123',    role: 'admin' },
  { name: 'Jane Smith',  email: 'customer@demo.com', password: 'Customer@123', role: 'user'  }
];

const products = [
  { name: 'iPhone 15 Pro',            price: 999,  category: 'Electronics', company: 'Apple',        stock: 20, description: 'Latest iPhone with titanium design and A17 Pro chip' },
  { name: 'Samsung Galaxy S24',       price: 799,  category: 'Electronics', company: 'Samsung',      stock: 25, description: 'Flagship Android phone with AI features' },
  { name: 'Sony WH-1000XM5',          price: 349,  category: 'Electronics', company: 'Sony',         stock: 30, description: 'Industry-leading noise cancelling headphones' },
  { name: 'MacBook Air M2',           price: 1099, category: 'Electronics', company: 'Apple',        stock: 15, description: 'Thin and light laptop powered by Apple M2 chip' },
  { name: 'iPad Pro 11"',             price: 799,  category: 'Electronics', company: 'Apple',        stock: 18, description: 'Pro tablet with M2 chip and Liquid Retina display' },
  { name: 'Nike Air Max 270',         price: 129,  category: 'Clothing',    company: 'Nike',         stock: 60, description: 'Comfortable running shoes with Air Max cushioning' },
  { name: "Levi's 501 Jeans",         price: 89,   category: 'Clothing',    company: "Levi's",       stock: 50, description: 'Classic straight fit jeans since 1873' },
  { name: 'Adidas Ultraboost 23',     price: 179,  category: 'Clothing',    company: 'Adidas',       stock: 40, description: 'High-performance running shoes with Boost technology' },
  { name: 'Atomic Habits',            price: 16,   category: 'Books',       company: 'Avery',        stock: 80, description: 'Build good habits and break bad ones by James Clear' },
  { name: 'The Great Gatsby',         price: 12,   category: 'Books',       company: 'Penguin',      stock: 70, description: 'Classic American novel by F. Scott Fitzgerald' },
  { name: 'Dune',                     price: 18,   category: 'Books',       company: 'Ace Books',    stock: 55, description: 'Epic science fiction novel by Frank Herbert' },
  { name: 'Dyson V15 Vacuum',         price: 699,  category: 'Home',        company: 'Dyson',        stock: 10, description: 'Cordless vacuum with laser dust detection' },
  { name: 'Instant Pot Duo 7-in-1',  price: 89,   category: 'Home',        company: 'Instant Pot',  stock: 22, description: 'Multi-cooker that replaces 7 kitchen appliances' },
  { name: 'Yoga Mat Premium',         price: 49,   category: 'Sports',      company: 'Manduka',      stock: 35, description: 'Non-slip yoga mat with superior cushioning' },
  { name: 'Dyson Airwrap Complete',   price: 599,  category: 'Beauty',      company: 'Dyson',        stock: 12, description: 'Multi-styling tool for curls, waves, and smoothing' }
];

async function createUsers() {
  const created = [];
  for (const userData of users) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`⚠️  User already exists: ${userData.email}`);
      created.push(existing);
      continue;
    }
    const user = new User(userData);
    await user.save();
    created.push(user);
  }
  return created;
}

async function createProducts(adminUser) {
  let count = 0;
  for (const productData of products) {
    const existing = await Product.findOne({ name: productData.name });
    if (existing) {
      console.log(`⚠️  Product already exists: ${productData.name}`);
      continue;
    }
    await new Product({ ...productData, userid: adminUser._id }).save();
    count++;
  }
  return count;
}

async function clearData() {
  await User.deleteMany({ email: { $in: users.map(u => u.email) } });
  await Product.deleteMany({ name: { $in: products.map(p => p.name) } });
  console.log('🗑️  Cleared existing demo data');
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const args = process.argv.slice(2);
  if (args.includes('--clear') || args.includes('-c')) {
    await clearData();
  }

  const createdUsers = await createUsers();
  const adminUser = createdUsers.find(u => u.role === 'admin');
  const productCount = await createProducts(adminUser);

  console.log('\n========================================');
  console.log('         🎉 Demo Data Ready!            ');
  console.log('========================================');
  console.log('\n👤 Admin Account:');
  console.log(`   Email    : ${users[0].email}`);
  console.log(`   Password : ${users[0].password}`);
  console.log(`   Role     : admin (can add/edit/delete products)`);
  console.log('\n🛍️  Customer Account:');
  console.log(`   Email    : ${users[1].email}`);
  console.log(`   Password : ${users[1].password}`);
  console.log(`   Role     : user (can browse and purchase products)`);
  console.log('\n📦 Products:');
  console.log(`   Total    : ${productCount} products created across 5 categories`);
  console.log('   Categories: Electronics, Clothing, Books, Home, Sports, Beauty');
  console.log('========================================\n');
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node demo-data.js [options]

Options:
  --clear, -c    Clear existing demo data before inserting
  --help, -h     Show this help message
  `);
  process.exit(0);
}

main()
  .catch(err => { console.error('❌ Error:', err.message); process.exit(1); })
  .finally(() => mongoose.connection.close());
