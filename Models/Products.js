const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    pro_name: {
        type: String,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    sale_price: {
        type: Number,
        required: true
    },
    pv: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    img1: {
        type: String,
        required: true
    },
    img2: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
)


const ProductModel = new mongoose.model("products", ProductSchema);
module.exports = ProductModel;