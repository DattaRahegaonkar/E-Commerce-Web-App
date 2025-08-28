const express = require("express");
const cors = require("cors");
require("./db/config");
const app = express();
const Users = require("./db/User");
const Product = require("./db/Product");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow requests from both Netlify and local development
const allowedOrigins = [
  'https://ecommercesignuplogin.netlify.app',
  'http://localhost:5173', // Default Vite dev server port
  'http://127.0.0.1:5173'  // Alternative localhost
];

app.use(cors({
  origin: "https://ecommercesignuplogin.netlify.app", // replace with your Netlify URL
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("App Running !!!")
})

app.get("/health", (req, res) => res.send("OK"));

app.post("/signup", async (req, res) => {
  try {
    let { email } = req.body;

    let user = await Users.findOne({ email: email });

    if (user) {
      return res
        .status(400)
        .json({ msg: "You are already registered with this email !" });
    }

    let newUser = new Users(req.body);
    let result = await newUser.save();

    result = result.toObject();
    delete result.password;

    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    if (req.body.password && req.body.email) {
      let user = await Users.findOne(req.body).select("-password");
      if (user) {
        res.send(user);
      } else {
        return res
          .status(400)
          .json({ msg: "You are not registered, please resistered !" });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/add", async (req, res) => {
  let newproduct = new Product(req.body);
  let result = await newproduct.save();

  res.send(result);
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

app.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, company } = req.body;
    
    // Find the product and verify ownership
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, category, company },
      { new: true }
    );
    
    res.json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error updating product" });
  }
});

// Add endpoint to get a single product by ID
app.get("/product/:id", async (req, res) => {
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
app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    
    res.json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error deleting product" });
  }
});

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log("Server is Running");
});
