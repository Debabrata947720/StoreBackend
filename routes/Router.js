const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const Signup = require("../controllers/auth/signup");
const Verify = require("../controllers/auth/OtpVerification");
const Login = require("../controllers/auth/Login");
const SendPdf = require("../controllers/User/SendPdf");
const UplodeFile = require("../controllers/Admin/UplodeFile");
const allPdf = require("../controllers/User/AllPdf");
const AdminVerify = require("../controllers/Admin/Verification")
const IsLogin = require("../Medilware/IsLogin");
const verifyAdmin = require("../controllers/Admin/isAdmin")
const AdminDashboardDetails = require("../controllers/Admin/AdminDashboardDetails")

router.post("/auth/login", Login);
router.post("/auth/signup", Signup);
router.post("/auth/verify", Verify);
router.post("/pdf", IsLogin, SendPdf);
router.post("/a/verify", AdminVerify);
router.post("/docoment",  allPdf);
router.post("/admin/details", IsLogin, verifyAdmin,AdminDashboardDetails);
router.post("/admin/upload", verifyAdmin,upload.single("file"), UplodeFile);

module.exports = router;
