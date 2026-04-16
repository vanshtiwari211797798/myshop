require("dotenv").config();
const mongoose = require('mongoose');

const URL = process.env.URL || 5000;

const ConnectData = async () => {
    try {
        await mongoose.connect(URL);
        console.log('Database connected successfully !');
    } catch (error) {
        console.error(`Unable to connect the database and error is ${error}`);
        process.exit(0);
    }
}


module.exports = ConnectData;