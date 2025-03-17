const jwt = require("jsonwebtoken");
const UserModel = require("../../models/User");
const { getValue } = require("../../config/redis");
const DeviseInfoModel = require("../../models/DeviseInfo");
const bcrypt = require('bcrypt')
const Verification = async (req, res) => {
    const { code, DeviseId } = req.body;
    const Verification = req.cookies.Verification;
    if (!Verification) {
        return res.status(400).json({ message: "Unauthorized" });
    }
    if (!DeviseId || DeviseId == "undefined") {
        return res.status(400).json({ message: "Invalid Device " });
    }

    const Decode = jwt.verify(Verification, process.env.JWT_SECRET_VERIFY);
    const { username, email, password } = Decode;

    const otp = await getValue(`OTP:${username}`);

    if (code != otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    res.clearCookie("Verification");

    const Salt = await bcrypt.genSalt(10)
    const Pass =await bcrypt.hash(password, Salt);
    const User = new UserModel({
        username,
        email,
        password: Pass,
    });
    const AuthToken = jwt.sign(
        { username: User.username, email: User.email },
        process.env.JWT_AUTH_SECRET
    );

    if (!req.headers["user-agent"]) {
        return res.status(400).json({ message: "Invalid Device" });
    }

    const info = new DeviseInfoModel({
        deviseId: DeviseId,
        username: User.username,
        useragent: req.headers["user-agent"],
    });
    await User.save();
    await info.save();

    res.cookie("AuthToken", AuthToken, {
        httpOnly: true,
    });
    res.status(200).json({ message: "Account Created Sucessfully " });
};
module.exports = Verification;
