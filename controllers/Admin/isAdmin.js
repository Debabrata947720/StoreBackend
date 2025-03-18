const jwt = require("jsonwebtoken");
const {getValue}= require("../../config/redis")
const verifyAdmin =async (req, res, next) => {
    const AdminToken = req.cookies.AdminToken;
  
    if (!AdminToken) {
        return res
            .status(403)
            .json({ message: "Unauthorized: No admin token provided" });
    }

    try {
        const decoded = jwt.verify(AdminToken, process.env.JWT_ADMIN_TOKEN_verify);
        console.log(decoded);
        if (!decoded.userId || !decoded.ss) {
            return res
                .status(403)
                .json({ message: "Unauthorized: Invalid admin token" });
        }
        const sskey = await getValue(`Admin:sesonKey${decoded.userId}`);
        if (sskey != decoded.ss) {
            return res
                .status(403)
                .json({ message: "Unauthorized: Error To verify login again" });
        }

        req.admin = {
            userId: decoded.userId,
        };
        next();
    } catch (error) {
        console.error("Admin token verification error:", error);

        // Handle specific JWT errors
        if (error.name === "JsonWebTokenError") {
            return res
                .status(403)
                .json({ message: "Unauthorized: Invalid token" });
        }
        if (error.name === "TokenExpiredError") {
            return res
                .status(401)
                .json({ message: "Unauthorized: Token expired" });
        }

        // Generic error response
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = verifyAdmin;
