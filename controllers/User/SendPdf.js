const { PDFDocument, rgb, degrees } = require("pdf-lib");
const pdfMODel = require("../../models/Pdf");
const axios = require("axios");

const sendPdf = async (req, res) => {
    const { ID } = req.body;

    try {
        // ✅ Fetch the PDF from DB
        const allPdf = await pdfMODel.find();
        if (!allPdf.length) {
            return res.status(404).json({ message: "No PDFs found" });
        }

        const selectedPdf = allPdf[0];
        if (selectedPdf.price !== 0) {
            return res.status(400).json({ message: "This PDF is not free" });
        }

        // ✅ Fetch the PDF file from Cloudinary
        const response = await axios.get(selectedPdf.fileUrl, {
            responseType: "arraybuffer", // Ensure binary format
        });
        const pdfBytes = response.data;

        // ✅ Load the PDF properly
        const pdfDoc = await PDFDocument.load(pdfBytes);
        pdfDoc.setAuthor("ASIF");

        // ✅ Ensure pages exist before adding watermark
        const pages = pdfDoc.getPages();
        if (pages.length === 0) {
            return res.status(400).json({ message: "PDF has no pages" });
        }

        // ✅ Apply watermark to all pages
        const { width, height } = pages[0].getSize();
        pages.forEach((page) => {
            page.drawText("PDF STORE", {
                x: width / 3,
                y: height / 2,
                size: 50,
                color: rgb(1, 0, 0),
                opacity: 0.1,
                rotate: degrees(30),
            });
        });

        // ✅ Save the modified PDF
        const finalPdfBytes = await pdfDoc.save();

        // ✅ Convert to Base64 properly
        const base64Pdf = Buffer.from(finalPdfBytes).toString("base64");

        res.json({
            message: "PDF processed successfully",
            pdf: base64Pdf, // 🔥 Correct Base64 encoding
            ID,
        });
    } catch (error) {
        console.error("❌ Error processing PDF:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to process PDF" });
        }
    }
};

module.exports = sendPdf;
