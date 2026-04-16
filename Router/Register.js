require("dotenv").config();
const express = require('express');
const router = express.Router();
const userModel = require('../Models/userModel');
const bcryptjs = require('bcryptjs');



router.post('/register', async (req, res) => {
    try {
        const { added_by, name, phone, email, password } = req.body;

        if (!added_by || !name || !phone || !email || !password) {
            return res.status(400).json({ msg: "All fields are required!" });
        }

        const existUser = await userModel.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });
        if (existUser) {
            return res.status(409).json({ msg: "User already exists" });
        }

        const user_id = 'MS' + Math.floor(10000 + Math.random() * 90000);
        const hashedPassword = await bcryptjs.hash(password, 10);

        let sponsor = await userModel.findOne({ user_id: added_by });

        if (!sponsor) {
            return res.status(404).json({ msg: "Sponsor not found" });
        }

        // ============================
        // STEP 1: ROOT LEFT & RIGHT
        // ============================

        const leftRoot = await userModel.findOne({
            parent_id: sponsor.user_id,
            position: "Left"
        });

        const rightRoot = await userModel.findOne({
            parent_id: sponsor.user_id,
            position: "Right"
        });

        // first 2 users
        if (!leftRoot) {
            return saveUser(res, userModel, {
                user_id, added_by, parent_id: sponsor.user_id,
                position: "Left", name, phone, email, password: hashedPassword
            });
        }

        if (!rightRoot) {
            return saveUser(res, userModel, {
                user_id, added_by, parent_id: sponsor.user_id,
                position: "Right", name, phone, email, password: hashedPassword
            });
        }

        // ============================
        // 🔥 STEP 2: COUNT BASED TOGGLE
        // ============================

        // sponsor ke total direct + downline count
        const totalUsers = await userModel.countDocuments({
            added_by: sponsor.user_id
        });

        // even → left , odd → right
        let useLeft = (totalUsers % 2 === 0);

        let finalParent = null;
        let finalPosition = null;

        if (useLeft) {
            // LEFT CHAIN
            let current = leftRoot;

            while (true) {
                let next = await userModel.findOne({
                    parent_id: current.user_id,
                    position: "Left"
                });

                if (!next) {
                    finalParent = current.user_id;
                    finalPosition = "Left";
                    break;
                }

                current = next;
            }

        } else {
            // RIGHT CHAIN
            let current = rightRoot;

            while (true) {
                let next = await userModel.findOne({
                    parent_id: current.user_id,
                    position: "Right"
                });

                if (!next) {
                    finalParent = current.user_id;
                    finalPosition = "Right";
                    break;
                }

                current = next;
            }
        }

        // ============================

        const newUser = new userModel({
            user_id,
            added_by,
            parent_id: finalParent,
            position: finalPosition,
            name,
            phone,
            email,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(201).json({
            msg: "User Registered Successfully!",
            parent_id: finalParent,
            position: finalPosition
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server Error" });
    }
});

async function saveUser(res, userModel, data) {
    const user = new userModel(data);
    await user.save();
    return res.status(201).json({
        msg: "User Registered Successfully!",
        parent_id: data.parent_id,
        position: data.position
    });
}




module.exports = router;