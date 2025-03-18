const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { getValue, setValue } = require("../../config/redis");

const Verify = async (req, res) => {
    const { otp } = req.body;

    const AdminCookie = req.cookies.AdminCookie;
    if (!AdminCookie) {
        return res
            .status(403)
            .json({ message: "Unauthorized: No AdminCookie found" });
    }

    if (!otp) {
        return res.status(400).json({ message: "OTP is required" });
    }

    try {
        const decoded = jwt.verify(AdminCookie, process.env.JWT_ADMIN_TOKEN);
        const { userId, SesonKey } = decoded;

        const redisSessionKey = await getValue(`Admin${userId}`);
        if (!redisSessionKey) {
            return res
                .status(401)
                .json({ message: "Session expired or invalid" });
        }

        if (redisSessionKey !== SesonKey) {
            return res
                .status(403)
                .json({ message: "Unauthorized: Invalid session key" });
        }

        const redisOTP = await getValue(`Admin:OTP${userId}`);
        if (!redisOTP) {
            return res.status(400).json({ message: "OTP expired or invalid" });
        }

        // Validate the OTP
        if (redisOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const authToken = jwt.sign({ userId }, process.env.JWT_AUTH_SECRET, {});

        const sessionSecret = crypto.randomBytes(16).toString("hex");
        await setValue(`Admin:sesonKey${userId}`, sessionSecret, 60 * 60);
        const adminToken = jwt.sign(
            { userId, ss: sessionSecret },
            process.env.JWT_ADMIN_TOKEN_VERIFY,
            { expiresIn: "1h" }
        );

        res.cookie("AuthToken", authToken, {
            httpOnly: true,
            secure: true,
        }).cookie("AdminToken", adminToken, {
                httpOnly: true,
                secure: true,
            })
            .status(200)
            .json({ message: "successful login as admin" });
    } catch (error) {
        console.error("Verify error:", error);

        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Invalid token" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = Verify;
