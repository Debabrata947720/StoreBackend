const jwt = require("jsonwebtoken");
const User = require("../../models/User"); // Your User model
const { setValue } = require("../../config/redis");
const { sendVerificationEmail } = require("../../config/mail");
const bcrypt = require("bcrypt");
const sanitizeInput = (data) => {
    const sanitized = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            sanitized[key] = String(data[key]);
        }
    }
    return sanitized;
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const signup = async (req, res) => {
    try {
        const body = sanitizeInput(req.body);
        const { username, email, password } = body;
        if (!email || !username || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const otp = generateOTP();
        await setValue(`OTP:${username}`, otp, 60 * 60 * 10);

        const response = await sendVerificationEmail(
            email,
            username,
            otp,
            `${process.env.FRONTEND_URL}/verify`
        );
        if (!response) {
            return res.status(500).json({ message: "Unable To Send Mail" });
        }
        const token = jwt.sign(
            { email, username, password },
            process.env.JWT_SECRET_VERIFY,
            {
                expiresIn: "10h",
            }
        );
        res.status(200)
            .cookie("Verification", token, {
                httpOnly: true,
                secure: true,
            })
            .json({
                message:
                    "Verification email sent. Please check your email for the OTP code to verify your account.",
                token,
            });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = signup;
