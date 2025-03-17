const cloudinary = require("../../config/cludnary"); // Fix typo
const fs = require("fs");
const pdfmodel = require("../../models/Pdf");
const uploadFile = async (req, res) => {
    const { title, description, price } = req.body;
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "Store",
            use_filename: true,
            resource_type: "auto",
        });
        // const result = {
        //     asset_id: "dbc916f65f314ac837fbb3ddc8112ea8",
        //     public_id: "Store/PDF_Store_1741860588994_1807_qxbimc",
        //     version: 1741860593,
        //     version_id: "17d603018dade830e1474cfc8a66e37a",
        //     signature: "33ad97fe5116b60fe29bdd505103990ced7b4484",
        //     width: 595,
        //     height: 841,
        //     format: "pdf",
        //     resource_type: "image",
        //     created_at: "2025-03-13T10:09:53Z",
        //     tags: [],
        //     pages: 4,
        //     bytes: 106603,
        //     type: "upload",
        //     etag: "7631534d4d8b5545e66d614358d763a8",
        //     placeholder: false,
        //     url: "http://res.cloudinary.com/dugdlc4ce/image/upload/v1741860593/Store/PDF_Store_1741860588994_1807_qxbimc.pdf",
        //     secure_url:
        //         "https://res.cloudinary.com/dugdlc4ce/image/upload/v1741860593/Store/PDF_Store_1741860588994_1807_qxbimc.pdf",
        //     asset_folder: "Store",
        //     display_name: "PDF_Store_1741860588994_1807_qxbimc",
        //     original_filename: "PDF_Store_1741860588994_1807",
        //     api_key: "435332951961943",
        // };
        fs.unlinkSync(req.file.path);
        const product = new pdfmodel({
            title,
            description,
            price,
            fileUrl: result.secure_url,
        });
        await product.save();
        console.log(product);
        res.json({
            message: "File uploaded successfully",
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        console.error("❌ Upload Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: `duplicate key error : ${error.keyValue.title} is alrady exist`,
                error: error,
            });
        }
    }
};

module.exports = uploadFile;
