require("dotenv").config();
const express = require('express');
const UsersRouter = express.Router();
const jwt = require('jsonwebtoken');
const secret_key = process.env.SECRET_KEY;
const userModel = require('../Models/userModel');
const bcrypt = require('bcryptjs');

//user login api 
UsersRouter.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({msg:"All fields is required"});
        }

        const is_exist = await userModel.findOne({email:email});
        if(!is_exist){
            return res.status(409).json({msg:"User not Registered !"});
        }

        //check password is currect or not 
        const is_password_right = await bcrypt.compare(password, is_exist.password);
        if(!is_password_right){
            return res.status(401).json({msg:"Invalid Creadential"});
        }

        
        const jwt_token = jwt.sign({id:is_exist._id}, secret_key, {expiresIn:"7d"});
        return res.status(200).json({msg:'User Login Successfully !', token:jwt_token, data:is_exist});


    } catch (error) {
        console.error(`Error from the login the user ${error}`);
    }
})


module.exports = UsersRouter;