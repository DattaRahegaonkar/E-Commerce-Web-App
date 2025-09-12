
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    company: String,
    stock: {
        type: Number,
        default: 1,
        min: 0
    }
}, { timestamps: true });


module.exports = mongoose.model("Product", ProductSchema)
