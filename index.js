const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Router = require("./routes/Router");
const cookieParser = require("cookie-parser");
const  path =require("path");
require("dotenv").config();
const app = express();
const statusMonitor = require("express-status-monitor")();
app.use(statusMonitor);
app.get("/",  statusMonitor.pageRoute);

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json());
app.use(
    "/pdf_images",
    express.static(path.join(__dirname, "public/pdf_images"))
);

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.use("/uploads", express.static("uploads"));

app.use("/api", Router);

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
