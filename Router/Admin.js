const express = require('express');
const productRouter = express.Router();
const multer = require('multer');
const productModel = require('../Models/Products');
const CartModel = require('../Models/AddToCart');
const userModel = require('../Models/userModel');


// storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const uploadProducts = multer({ storage: storage });

// 👇add product api
productRouter.post(
    '/add-products',
    uploadProducts.fields([
        { name: 'img1', maxCount: 1 },
        { name: 'img2', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { pro_name, mrp, sale_price, pv, discount, description, color, size } = req.body;

            // file check
            if (!req.files || !req.files.img1 || !req.files.img2) {
                return res.status(400).json({ msg: 'Both images are required' });
            }

            const img1 = req.files.img1[0].path;
            const img2 = req.files.img2[0].path;

            // validation
            if (!pro_name || !mrp || !sale_price || !pv || !discount || !description || !color || !size) {
                return res.status(400).json({ msg: 'All fields are required' });
            }

            // save
            const newProduct = new productModel({
                pro_name,
                mrp,
                sale_price,
                pv,
                discount,
                description,
                color,
                size,
                img1,
                img2
            });

            await newProduct.save();

            res.status(200).json({ msg: 'Product added successfully' });

        } catch (error) {
            console.error("Error from add product:", error);
            res.status(500).json({ msg: 'Server error' });
        }
    }
);



//fetch all product api
productRouter.get('/get-product', async (_, res) => {
    try {
        const get_all_product = await productModel.find();
        return res.status(200).json({ msg: 'Product fetched successfully', data: get_all_product });
    } catch (error) {
        console.error(`Error from the get all products and error is the ${error}`)
    }
})

//fet product by the id 
productRouter.get('/get-product-details/:id', async (req, res) => {
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
productRouter.post('/add-to-cart/:user_id/:id/:color/:size', async (req, res) => {
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
productRouter.put('/update-cart/:id/:quantity', async (req, res) => {
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
productRouter.get('/get-coins-details/:user_id', async (req, res) => {
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
            return res.status(200).json({ msg: "Success", coin: get_coin_details, currentcoin:off_percentage_is });
        }


    } catch (error) {
        console.error(`Error from the getting current coins details and error is the ${error}`)
    }
})
  



module.exports = productRouter;