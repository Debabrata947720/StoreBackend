const Pdf = require("../../models/Pdf");
const User = require("../../models/User");
const Purchase = require("../../models/Purchase");

const AdminDashboardDetails = async (req, res) => {
    try {
        const totalPDFs = await Pdf.countDocuments();
        const totalUsers = await User.countDocuments({ isAdmin: false }); // Count only non-admin users
        const totalPurchases = await Purchase.countDocuments();
        const totalAmountCollected = await Purchase.aggregate([
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]);

        res.status(200).json({
            totalPDFs,
            totalUsers,
            totalPurchases,
            totalAmountCollected:
                totalAmountCollected.length > 0
                    ? totalAmountCollected[0].totalAmount
                    : 0,
        });
    } catch (error) {
        console.error("Error fetching dashboard details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = AdminDashboardDetails;
