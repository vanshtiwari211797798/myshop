const mongoose = require('mongoose');


const Schema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    added_by: {
        type: String,
        required: true
    },
    parent_id: {
        type: String,
        required: true
    },
    coins: {
        type: Number,
        required: true,
        default:1000
    },
    position: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const userModel = new mongoose.model("users", Schema);

module.exports = userModel;