import asyncHandler from "express-async-handler";
import User from "../Models/userModel.js"; // <-- Make sure this path is correct

export const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ auth0Id: id }); // <-- Use User, not user
        console.log("Fetched user:", user); // <-- Log the fetched user
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log("error in getting user:", error.message); // <-- Log the actual error
        return res.status(500).json({
            message: "internal server error",
        });
    }
});