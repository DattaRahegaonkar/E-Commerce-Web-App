const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
require("./db/config");
const app = express();
const Users = require("./db/User");
const Product = require("./db/Product");
const Cart = require("./db/Cart");
const Order = require("./db/Order");
const Payment = require("./db/Payment");
const { generateToken, authenticateToken } = require("./middleware/auth");
const { validateSignup, validateLogin, validateProduct, validateProductId } = require("./middleware/validators");

// Mock admin notification function
const sendAdminNotification = async (order) => {
    try {
        // In a real application, this would send email/SMS notifications
        console.log(`📧 ADMIN NOTIFICATION:`);
        console.log(`   New Order: ${order.orderId}`);
        console.log(`   Customer: ${order.userId}`);
        console.log(`   Items: ${order.items.length}`);
        console.log(`   Total: ₹${order.totalAmount}`);
        console.log(`   Payment: ${order.paymentMethod}`);
        console.log(`   Status: ${order.orderStatus}`);

        // Here you could integrate with:
        // - Email service (Nodemailer, SendGrid)
        // - SMS service (Twilio)
        // - Push notifications
        // - Slack/Discord webhooks

        return true;
    } catch (error) {
        console.error('Error sending admin notification:', error);
        return false;
    }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie-parser middleware

// Parse ALLOWED_ORIGINS from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'https://ecommercesignuplogin.netlify.app']; // fallback

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Debug CORS
app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Method:', req.method);
  next();
});

app.get("/", (req, res) => {
  res.send("App Running !!!")
})

app.get("/api/health", (req, res) => res.send("OK"));

app.post("/api/signup", validateSignup, async (req, res) => {
  try {
    let { email } = req.body;

    let user = await Users.findOne({ email: email });

    if (user) {
      return res
        .status(400)
        .json({ message: "You are already registered with this email!" });
    }

    let newUser = new Users(req.body);
    let result = await newUser.save();

    // Generate JWT token
    const token = generateToken(result._id);
    
    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // secure in production
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    result = result.toObject();
    delete result.password;

    res.status(201).json({ user: result });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    try {
      // Check password using bcrypt
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate JWT token
      const token = generateToken(user._id);
      
      // Set token in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // secure in production
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(200).json({ user: userResponse });
    } catch (passwordError) {
      console.error("Password comparison error:", passwordError);
      return res.status(500).json({ message: "Error verifying credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add logout endpoint
app.post("/api/logout", (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  res.status(200).json({ message: "Logged out successfully" });
});

// Protected route - requires admin authentication
app.post("/api/add", authenticateToken, validateProduct, async (req, res) => {
  try {
    // Check if user is admin
    const user = await Users.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required to add products" });
    }

    const productData = {
      ...req.body,
      userid: req.user.id // Add the admin user ID
    };

    let newproduct = new Product(productData);
    let result = await newproduct.save();

    res.status(201).json(result);
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ message: "Error adding product" });
  }
});

app.get("/api/show", async (req, res) => {

  let products = await Product.find({});

  res.send(products);

});

app.get("/api/search/:key", async (req, res) => {
  let result = await Product.find({
    $or: [
      {
        name: { $regex: req.params.key, $options: "i" },
      },
      {
        company: { $regex: req.params.key },
      },
      {
        category: { $regex: req.params.key },
      },
    ],
  });

  if (result.length == 0) {
    return res.status(400).json({ msg: "result not found" });
  }

  res.send(result);
});

app.patch("/api/update/:id", authenticateToken, validateProductId, validateProduct, async (req, res) => {
  try {
    // Check if user is admin
    const user = await Users.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required to update products" });
    }

    const { id } = req.params;
    const { name, price, category, company, stock, description, image } = req.body;

    // Find the product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, category, company, stock, description, image },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});

// Handle GET requests to /update/:id - redirect to frontend

// Add endpoint to get a single product by ID
app.get("/api/product/:id", validateProductId, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ msg: "Error fetching product" });
  }
});

// Add API prefix routes for cleaner separation
app.get("/api/product/:id", validateProductId, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ msg: "Error fetching product" });
  }
});

app.patch("/api/update/:id", authenticateToken, validateProductId, validateProduct, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, company, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, category, company, stock },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});

app.delete("/api/delete/:id", authenticateToken, validateProductId, async (req, res) => {
  try {
    // Check if user is admin
    const user = await Users.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required to delete products" });
    }

    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

// Add delete endpoint - any authenticated user can delete any product
app.delete("/api/delete/:id", authenticateToken, validateProductId, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Delete the product
    await Product.findByIdAndDelete(id);
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

// ==================== CART ENDPOINTS ====================

// Get user's cart
app.get("/api/cart", authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }
    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// Add item to cart
app.post("/api/cart/add", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.productId');

    res.json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Error adding item to cart" });
  }
});

// Update cart item quantity
app.put("/api/cart/update/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Check stock availability
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.productId');

    res.json(cart);
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Error updating cart" });
  }
});

// Remove item from cart
app.delete("/api/cart/remove/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    await cart.populate('items.productId');

    res.json(cart);
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Error removing item from cart" });
  }
});

// Clear entire cart
app.delete("/api/cart/clear", authenticateToken, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Error clearing cart" });
  }
});

// ==================== ORDER ENDPOINTS ====================

// Place new order
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate stock availability
    for (const item of cart.items) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.price,
      name: item.productId.name,
      company: item.productId.company
    }));

    // Create order
    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress,
      paymentMethod
    });

    // Save order and ensure orderId is generated
    const savedOrder = await order.save();

    // Double-check that orderId exists
    if (!savedOrder.orderId) {
      // Manually generate orderId if pre-save hook didn't work
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      savedOrder.orderId = `ORD-${timestamp}-${random}`;
      await savedOrder.save();
    }

    // Create payment record
    const payment = new Payment({
      orderId: savedOrder._id,
      userId: req.user.id,
      amount: savedOrder.totalAmount,
      paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'completed', // Online payments are marked as completed immediately
      paymentDate: paymentMethod === 'online' ? new Date() : null // Set payment date for online payments
    });

    await payment.save();

    // For online payments, revenue is added immediately when order is placed
    if (paymentMethod === 'online') {
      console.log(`💰 Online Payment Revenue Added: ₹${savedOrder.totalAmount} for Order ${savedOrder.orderId}`);
      console.log(`   Payment ID: ${payment._id}`);
      console.log(`   Payment Status: ${payment.status}`);
      console.log(`   Payment Date: ${payment.paymentDate}`);
    }

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await Cart.findOneAndDelete({ userId: req.user.id });

    // Notify admin about new order
    await sendAdminNotification(savedOrder);

    res.status(201).json({
      order: savedOrder,
      payment,
      message: "Order placed successfully"
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ message: "Error placing order" });
  }
});

// Get user's orders
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ orderDate: -1 })
      .populate('items.productId');

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get specific order
app.get("/api/orders/:orderId", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Try to find by orderId string first, then by _id if not found
    let order = await Order.findOne({
      orderId: orderId,
      userId: req.user.id
    }).populate('items.productId');

    // If not found by orderId, try by _id (for backward compatibility)
    if (!order) {
      order = await Order.findOne({
        _id: orderId,
        userId: req.user.id
      }).populate('items.productId');
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
});

// Cancel order (user can cancel before shipping)
app.put("/api/orders/:orderId/cancel", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancellation for pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage. Please contact customer support."
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    await order.save();

    // Update payment status if it was paid
    if (order.paymentStatus === 'paid') {
      await Payment.findOneAndUpdate(
        { orderId: order._id },
        { status: 'refunded' }
      );
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    res.json({
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Error cancelling order" });
  }
});

// ==================== PAYMENT ENDPOINTS ====================

// Initiate online payment
app.post("/api/payment/initiate", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id,
      paymentMethod: 'online'
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Simulate payment gateway response
    const paymentResponse = {
      orderId: order.orderId,
      amount: order.totalAmount,
      currency: 'INR',
      paymentUrl: `http://localhost:8081/api/payment/mock-gateway/${orderId}`,
      transactionId: `TXN-${Date.now()}`
    };

    res.json(paymentResponse);
  } catch (error) {
    console.error("Initiate payment error:", error);
    res.status(500).json({ message: "Error initiating payment" });
  }
});

// Mock payment gateway
app.get("/api/payment/mock-gateway/:orderId", async (req, res) => {
  const { orderId } = req.params;

  // Simple HTML form to simulate payment
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Mock Payment Gateway</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
            .payment-form { background: #f9f9f9; padding: 20px; border-radius: 8px; }
            button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #45a049; }
        </style>
    </head>
    <body>
        <div class="payment-form">
            <h2>Mock Payment Gateway</h2>
            <p>Order ID: ${orderId}</p>
            <p>Amount: ₹${Math.floor(Math.random() * 1000) + 100}</p>
            <form action="/api/payment/verify" method="POST">
                <input type="hidden" name="orderId" value="${orderId}">
                <button type="submit">Pay Now (Simulated)</button>
            </form>
        </div>
    </body>
    </html>
  `;

  res.send(html);
});

// Verify payment
app.post("/api/payment/verify", authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentMethod, transactionId, upiId, cardNumber, bank } = req.body;

    console.log('Payment verification request:', {
      orderId,
      paymentMethod,
      transactionId,
      upiId: upiId ? 'provided' : 'not provided',
      cardNumber: cardNumber ? 'provided' : 'not provided',
      bank: bank ? 'provided' : 'not provided'
    });

    // Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log('Found order:', { orderId: order.orderId, status: order.orderStatus });

    // Update order status
    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    await order.save();

    console.log('Order updated:', { orderId: order.orderId, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus });

    // Update payment record with additional details
    const paymentUpdate = await Payment.findOneAndUpdate(
      { orderId: order._id },
      {
        status: 'completed',
        transactionId: transactionId || `TXN-${Date.now()}`,
        paymentGateway: paymentMethod,
        metadata: {
          upiId: paymentMethod === 'upi' ? upiId : undefined,
          cardLastFour: paymentMethod === 'card' ? cardNumber?.slice(-4) : undefined,
          bank: paymentMethod === 'netbanking' ? bank : undefined
        }
      },
      { new: true }
    );

    console.log('Payment record updated:', paymentUpdate ? 'success' : 'failed');

    // Send admin notification
    await sendAdminNotification(order);

    console.log('Payment verified and order updated successfully, redirecting...');

    // Return JSON response for better frontend handling
    res.json({
      success: true,
      message: "Payment verified successfully",
      orderId: order.orderId,
      redirectUrl: `http://localhost:5173/order-confirmation/${orderId}`
    });

  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
});

// ==================== ADDRESS ENDPOINTS ====================

// Get user's addresses
app.get("/api/addresses", authenticateToken, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.addresses || []);
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ message: "Error fetching addresses" });
  }
});

// Add new address
app.post("/api/addresses", authenticateToken, async (req, res) => {
  try {
    const { name, address, city, state, pincode, phone, isDefault } = req.body;

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If this is the default address, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // If this is the first address, make it default
    const isFirstAddress = user.addresses.length === 0;

    const newAddress = {
      name,
      address,
      city,
      state,
      pincode,
      phone,
      isDefault: isDefault || isFirstAddress
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json(newAddress);
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: "Error adding address" });
  }
});

// Update address
app.put("/api/addresses/:addressId", authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, address, city, state, pincode, phone, isDefault } = req.body;

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      name,
      address,
      city,
      state,
      pincode,
      phone,
      isDefault
    };

    await user.save();
    res.json(user.addresses[addressIndex]);
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Error updating address" });
  }
});

// Delete address
app.delete("/api/addresses/:addressId", authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default and there are other addresses, make first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Error deleting address" });
  }
});

// Get default address
app.get("/api/addresses/default", authenticateToken, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const defaultAddress = user.addresses.find(addr => addr.isDefault);
    if (!defaultAddress) {
      return res.status(404).json({ message: "No default address found" });
    }

    res.json(defaultAddress);
  } catch (error) {
    console.error("Get default address error:", error);
    res.status(500).json({ message: "Error fetching default address" });
  }
});


// ==================== ADMIN ENDPOINTS ====================

// Get all orders (admin only)
app.get("/api/admin/orders", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await Users.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId')
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get admin orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Update order status (admin only)
app.put("/api/admin/orders/:orderId/status", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await Users.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.orderStatus;

    // Update order status
    order.orderStatus = orderStatus;
    await order.save();

    // If COD order is being marked as delivered, add to revenue
    if (order.paymentMethod === 'cod' && orderStatus === 'delivered' && previousStatus !== 'delivered') {
      try {
        // Find and update the payment record
        const paymentUpdate = await Payment.findOneAndUpdate(
          { orderId: order._id },
          {
            status: 'completed',
            paymentDate: new Date()
          },
          { new: true }
        );

        if (paymentUpdate) {
          console.log(`💰 COD Revenue Added: ₹${order.totalAmount} for Order ${order.orderId}`);
          console.log(`   Payment ID: ${paymentUpdate._id}`);
          console.log(`   Payment Status: ${paymentUpdate.status}`);
          console.log(`   Payment Date: ${paymentUpdate.paymentDate}`);
        } else {
          console.log(`❌ COD Revenue Update Failed: No payment record found for Order ${order.orderId}`);
        }
      } catch (paymentError) {
        console.error(`❌ COD Revenue Update Error for Order ${order.orderId}:`, paymentError);
      }
    }

    // Note: Online payment revenue is already added when order is placed
    // COD revenue is added when order is marked as delivered

    // Populate user data for response
    await order.populate('userId', 'name email');

    res.json(order);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
});

// Get admin dashboard stats
app.get("/api/admin/dashboard", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await Users.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });

    // Calculate revenue from completed payments
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get revenue breakdown by payment method
    const revenueByMethod = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      revenueBreakdown: revenueByMethod.reduce((acc, item) => {
        acc[item._id] = { amount: item.total, count: item.count };
        return acc;
      }, {})
    };

    console.log('📊 Dashboard Stats:', stats);

    res.json(stats);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
});

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log("Server is Running");
});
