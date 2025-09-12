const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
require("./db/config");
const app = express();
const Users = require("./db/User");
const Product = require("./db/Product");
const { generateToken, authenticateToken } = require("./middleware/auth");
const { validateSignup, validateLogin, validateProduct, validateProductId } = require("./middleware/validators");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie-parser middleware

// Allow requests from both Netlify and local development
const allowedOrigins = [
  'https://ecommercesignuplogin.netlify.app',
  'http://localhost:5173', // Default Vite dev server port
  'http://127.0.0.1:5173'  // Alternative localhost
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);

    if(allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get("/", (req, res) => {
  res.send("App Running !!!")
})

app.get("/health", (req, res) => res.send("OK"));

app.post("/signup", validateSignup, async (req, res) => {
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

app.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    try {
      // Check password with extra error handling
      let isMatch = false;
      
      // Check if the user has a comparePassword method (for older accounts)
      if (typeof user.comparePassword === 'function') {
        isMatch = await user.comparePassword(password);
      } else {
        // For older accounts without hashed passwords (temporary fallback)
        isMatch = (user.password === password);
        
        // If match with plain password, update to hashed version
        if (isMatch) {
          // Update to hashed password for future logins
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
        }
      }
      
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
app.post("/logout", (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  res.status(200).json({ message: "Logged out successfully" });
});

// Protected route - requires authentication and validation
app.post("/add", authenticateToken, validateProduct, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      userid: req.user.id // Add the user ID from the JWT token
    };
    
    let newproduct = new Product(productData);
    let result = await newproduct.save();

    res.status(201).json(result);
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ message: "Error adding product" });
  }
});

app.get("/show", async (req, res) => {

  let products = await Product.find({});

  res.send(products);

});

app.get("/search/:key", async (req, res) => {
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

app.patch("/update/:id", authenticateToken, validateProductId, validateProduct, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, company } = req.body;
    
    // Find the product and verify ownership
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Log product ownership details for debugging
    console.log('Product update - Product ID:', id);
    console.log('Product update - Product userid:', product.userid);
    console.log('Product update - Current user:', req.user.id);
    
    // Verify the user owns this product - temporarily disabled for testing
    // if (product.userid && product.userid.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Not authorized to update this product" });
    // }
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, category, company },
      { new: true }
    );
    
    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});

// Add endpoint to get a single product by ID
app.get("/product/:id", validateProductId, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error fetching product" });
  }
});

// Add delete endpoint
app.delete("/delete/:id", authenticateToken, validateProductId, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the product first to check ownership
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Log product ownership details for debugging
    console.log('Product delete - Product ID:', id);
    console.log('Product delete - Product userid:', product.userid);
    console.log('Product delete - Current user:', req.user.id);
    
    // Verify the user owns this product - temporarily disabled for testing
    // if (product.userid && product.userid.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Not authorized to delete this product" });
    // }
    
    // Delete the product
    await Product.findByIdAndDelete(id);
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log("Server is Running");
});
