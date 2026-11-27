import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // let {token} = req.cookies || {};
    const token = req.cookies?.token ||
    (authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);
        
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = verifyToken.userId;
    next();
}catch (error) {
    console.log("Authentication Error:", error.message);

    return res.status(401).json({
        message: "Invalid or expired token"
    });

    }
}

