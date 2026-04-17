const mongoose = require('mongoose');


const WelletSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    utr: {
        type: Number,
        required: true
    },
    screenshot: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 0
    }
},
    {
        timestamps: true
    }
)


const WalletModel = new mongoose.model("wallets", WelletSchema);

module.exports = WalletModel;




