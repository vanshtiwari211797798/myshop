require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./Router/Register');
const UsersRouter = require('./Router/Users');
const adminRouter = require('./Router/Admin');
const ConnectData = require('./DB/db');
const PORT = process.env.PORT || 5000;


//here integrate the middleware
app.use(express.json());
app.use('/user', router);
app.use('/users',UsersRouter);
app.use('/admin',adminRouter);



ConnectData().then(() => {
    app.listen((PORT), () => {
        console.log('Software is running on the port number ' + PORT);
    })
})
.catch((err) => console.error(`Error from the database connection ${err}`))