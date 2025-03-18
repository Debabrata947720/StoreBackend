const UserModel = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { setValue } = require("../../config/redis");
const { sendVerificationEmail } = require("../../config/mail");
const Login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try {
        // Find user by username
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare passwords
        const IsMatch = await bcrypt.compare(password, user.password);
        if (!IsMatch) {
            return res
                .status(400)
                .json({ message: "Credentials do not match" });
        }

        if (!user.isAdmin) {
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_AUTH_SECRET
            );
            res.cookie("AuthToken", token, {
                httpOnly: true,
                secure: true,
            });
            return res.status(200).json({ message: "Login successful", token });
        }

        const SesonKey = crypto.randomBytes(32).toString("hex");
        const AdminCookie = jwt.sign(
            { userId: user._id, SesonKey },
            process.env.JWT_ADMIN_TOKEN,
            { expiresIn: "1h" }
        );
        const Code = crypto.randomBytes(5).toString("hex").toUpperCase();

        const r = await setValue(`Admin:OTP${user._id}`, Code, 60 * 60);

        // const response = await sendVerificationEmail(
        //     user.email,
        //     user.username,
        //     Code,
        //     `${process.env.FRONTEND_URL}/admin/verify`
        // );
        // if (!response) {
        //     return res.status(500).json({ message: "Unable To Send Mail" });
        // }
        await setValue(`Admin${user._id}`, SesonKey, 60 * 60);

        // Set admin cookie and send response
        res.cookie("AdminCookie", AdminCookie, {
            httpOnly: true,
            secure: true,
        });
        return res
            .status(302)
            .json({ message: " Verify You Are Admin ", t: "A" });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = Login;
