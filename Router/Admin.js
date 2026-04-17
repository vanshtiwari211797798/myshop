const express = require('express');
const adminRouter = express.Router();
const multer = require('multer');
const productModel = require('../Models/Products');


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
adminRouter.post(
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
adminRouter.get('/get-product', async (_, res) => {
    try {
        const get_all_product = await productModel.find();
        return res.status(200).json({ msg: 'Product fetched successfully', data: get_all_product });
    } catch (error) {
        console.error(`Error from the get all products and error is the ${error}`)
    }
})





module.exports = adminRouter;