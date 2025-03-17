const pdf = require("../../models/Pdf");
const allPdf = async (req, res) => {
    try {
        console.log(req.body);
        const result = await pdf.aggregate([
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    createdAt: 1,
                    price:1
                },
            },
        ]);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.json("error");
    }
};
module.exports = allPdf;
