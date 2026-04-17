require("dotenv").config();
const express = require('express');
const UsersRouter = express.Router();
const jwt = require('jsonwebtoken');
const secret_key = process.env.SECRET_KEY;
const userModel = require('../Models/userModel');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const productModel = require('../Models/Products');
const CartModel = require('../Models/AddToCart');
const WalletModel = require('../Models/Wallet');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});


const uploadPayment_SS = multer({ storage: storage });


//user login api 
UsersRouter.post('/login', async (req, res) => {
    try {
        const { user_id, password } = req.body;
        if (!user_id || !password) {
            return res.status(400).json({ msg: "All fields is required" });
        }

        const is_exist = await userModel.findOne({ user_id: user_id });
        if (!is_exist) {
            return res.status(409).json({ msg: "User not Registered !" });
        }

        //check password is currect or not 
        const is_password_right = await bcrypt.compare(password, is_exist.password);
        if (!is_password_right) {
            return res.status(401).json({ msg: "Invalid Creadential" });
        }


        const jwt_token = jwt.sign({ id: is_exist._id }, secret_key, { expiresIn: "7d" });
        return res.status(200).json({ msg: 'User Login Successfully !', token: jwt_token, data: is_exist });


    } catch (error) {
        console.error(`Error from the login the user ${error}`);
    }
})



//fet product by the id 
UsersRouter.get('/get-product-details/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ msg: 'Id is not received from the paramiter' })
        }

        // if id is recived from the paramiter then  - 

        const get_product_data = await productModel.findById(id);
        return res.status(200).json({ msg: 'Product fetched successfully', data: get_product_data });

    } catch (error) {
        console.error(`Error from the get product by the id and error isd the ${error}`)
    }
})



//add to cart api by the product id
//id = product table _id
UsersRouter.post('/add-to-cart/:user_id/:id/:color/:size', async (req, res) => {
    try {
        const { user_id, id, color, size } = req.params;
        if (!id || !user_id || !color || !size) {
            return res.status(400).json({ msg: 'All details are required !' });
        }

        //fetch the product details based on the product id 
        const fetch_products = await productModel.findById(id);

        if (!fetch_products) {
            return res.status(404).json({ msg: 'Product is not available' });
        }

        //Check that same user is allready added the same product into the cart
        const user_allready_add_prodduct = await CartModel.findOne({ user_id: user_id, product_id: id });
        if (user_allready_add_prodduct) {
            return res.status(409).json({ msg: 'Allready add the same product !' });
        }

        const addToCartProduct = new CartModel({
            user_id,
            product_id: id,
            mrp: fetch_products.mrp,
            sale_price: fetch_products.sale_price,
            description: fetch_products.description,
            main_mrp: fetch_products.mrp,
            main_sale_price: fetch_products.sale_price,
            color: color,
            size: size
        });
        await addToCartProduct.save();
        return res.status(201).json({ msg: 'Product added to the cart successfully !' });

    } catch (error) {
        console.error(`Error from the add to cart the products ${error}`)
    }
})



//update the cart products 
//id = cart table _id
UsersRouter.put('/update-cart/:id/:quantity', async (req, res) => {
    try {
        const { id, quantity } = req.params;
        if (!id || !quantity) {
            return res.status(400).json({ msg: "All fields is required !", success: false });
        }

        //if _id and quantity received from the params

        const find_the_product = await CartModel.findById(id);

        if (!find_the_product) {
            return res.status(404).json({ msg: 'Product is not available' });
        }

        const sale_price = (find_the_product.main_sale_price) * quantity;
        const mrp = (find_the_product.main_mrp) * quantity;

        const is_updated = await CartModel.findByIdAndUpdate(id, {
            mrp: mrp,
            sale_price: sale_price,
            quantity: quantity
        },
            {
                new: true
            }
        );

        if (!is_updated) {
            return res.status(409).json({ msg: "Something went wrong, unable to update the cart" });
        }

        return res.status(200).json({ msg: "Cart Updated Successfully !" })

    } catch (error) {
        console.error(`Error from the update the cart ${error}`)
    }
})



//get login u8ser coins details of the 10% of the sale price and 1 coins  = 1 rs
UsersRouter.get('/get-coins-details/:user_id', async (req, res) => {
    try {
        const user_id = req.params.user_id;


        if (!user_id) {
            return res.status(400).json({ msg: "User is not logedin, please login and try again !" });
        }

        //find the coins 
        const welcomeBonusFind = await userModel.findOne({ user_id: user_id });
        if (!welcomeBonusFind) {
            return res.status(404).json({ msg: "User not found" });
        }

        //get the coins details 
        const get_coin_details = welcomeBonusFind.coins;
        if (get_coin_details > 0) {
            //calculate the off percentage
            const off_percentage_is = (get_coin_details * 10) / 100;
            return res.status(200).json({ msg: "Success", coin: get_coin_details, currentcoin: off_percentage_is });
        }


    } catch (error) {
        console.error(`Error from the getting current coins details and error is the ${error}`)
    }
})


//get the referral name
UsersRouter.get('/get-ref-name/:user_id', async (req, res) => {
    try {
        const user_id = req.params.user_id;

        if (!user_id) {
            return res.status(400).json({ msg: "All fields is required !" });
        }

        //if user_id is received then 

        const fetch_name = await userModel.findOne({ user_id: user_id }, {
            name: 1, _id: 0
        });

        if (!fetch_name) {
            return res.status(404).json({ msg: "Invalid user_id !" });
        }

        return res.status(200).json({ msg: "Data fetched successfully !", data: fetch_name });

    } catch (error) {
        console.error(`Error from the get the referral name and error is the ${error}`);
    }
})



//api for the proceed to checkout 
UsersRouter.get('/checkout-coin-data/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({msg:"All fields is required"})
        }

        // if received from the query paramiter
        
        const get_total_cart_amount = await CartModel.find({user_id:user_id});
        let total = 0;
        get_total_cart_amount.forEach((item) => {
            total+=item.sale_price
        })

        //10% of the total cart sale price 
        let finalOffAmount = (total * 10) / 100;

        return res.status(200).json({msg:"Data fetched successfully !", amount:finalOffAmount});


    } catch (error) {
        console.error(`Error from the getting checkout coin data`)
    }
})




UsersRouter.post('/recharge-wallet', uploadPayment_SS.single('screenshot'), async (req, res) => {
    try {
        const {user_id, amount, utr} = req.body;

        if(!req.file){
            return res.status(400).json({msg:"Screenshots is required"}); 
        }

        const screenshot = req.file.path;
        
        if(!user_id || !amount || !utr || !screenshot){
            return res.status(400).json({msg:"All fields is required !"});
        }

        const RechargeNow = new WalletModel({user_id, amount, utr, screenshot});
        await RechargeNow.save();
        return res.status(200).json({msg:'Recharge Successfully'});


    } catch (error) {
        console.error(`Error from the recharge wallet and error is ${error}`)
    }
})


module.exports = UsersRouter;