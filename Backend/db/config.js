require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected!'));

const productschema = new mongoose.Schema({});

const Products = mongoose.model("Products", productschema)