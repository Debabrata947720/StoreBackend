const jwt = require("jsonwebtoken");
const IsLogin = async (req, res, next) => {
    const Authtoken = req.cookies.AuthToken;
    if (!Authtoken) {
        return res.status(401).json({ message: "We Need Login" });
    }
    try {
        const isValid = jwt.verify(Authtoken, process.env.JWT_AUTH_SECRET);
        req.userID = isValid.userId;
        next();
    } catch (error) {
        console.log(error);
        if (error.name == "JsonWebTokenError") {
            return res.status(401).json({ message: "Token modifyded : Login Again" });
        }
        res.status(401).json({ message: "We Cannot Verifi You please LOgain Again" });
    }
};
module.exports = IsLogin;
