import User from "../models/user.model.js";

export const getUser = async (req, res) => {
    try {
        const userId = req.userId; // Get the user ID from the request object
        //adding .select("-password") so that the user's password is not returned to the frontend.
        const user = await User.findOne({ _id: req.userId }).select("-password"); // Find the user in the database by ID
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("getUser error:", error);
        res.status(500).json({
          error: `failed to get current user: ${error.message}`
        });
    }
};