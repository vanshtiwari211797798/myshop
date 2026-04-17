const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
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
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    main_mrp: {
        type: Number,
        required: true
    },
    main_sale_price: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
)



const CartModel = new mongoose.model('carts', CartSchema);
module.exports = CartModel;