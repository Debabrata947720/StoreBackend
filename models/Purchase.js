const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
    {
        username: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        pdf: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pdf",
            required: true,
        },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Purchase", PurchaseSchema);
