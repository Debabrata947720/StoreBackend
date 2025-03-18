const pdfMODel = require("../../models/Pdf");
const axios = require("axios");
const { PDFDocument, rgb, degrees } = require("pdf-lib");

const sendPdf = async (req, res) => {
    const { ID } = req.body;

    try {
        const selectedPdf = await pdfMODel.findById(ID);
        if (!selectedPdf) {
            return res.status(404).json({ message: "No PDFs found" });
        }

        if (selectedPdf.price !== 0) {
            return res.status(400).json({ message: "This PDF is not free" });
        }

        const response = await axios.get(selectedPdf.fileUrl, {
            responseType: "arraybuffer",
        });
        const pdfBytes = response.data;

        const pdfDoc = await PDFDocument.load(pdfBytes);

        const pages = pdfDoc.getPages();
        if (pages.length === 0) {
            return res.status(400).json({ message: "PDF has no pages" });
        }

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
            page.drawText(`${req.userID}`, {
                x: 4,
                y: 4,
                size: 10,
                color: rgb(0.2, 0, 0),
                opacity: 0.3,
            });
        });

        const finalPdfBytes = await pdfDoc.save();

        const base64Pdf = Buffer.from(finalPdfBytes).toString("base64");

        const imageUrl = selectedPdf.fileUrl
            .replace("/upload/", "/upload/pg_1,c_thumb/")
            .replace(".pdf", ".jpeg");

        const ThubnellResponse = await axios.get(imageUrl, {
            responseType: "arraybuffer",
        });
        const base64Img = Buffer.from(ThubnellResponse.data).toString("base64");

        res.json({
            pdf: base64Pdf,
            ID,
            Title: selectedPdf.title,
            Thubnell: base64Img,
        });
    } catch (error) {
        console.error("❌ Error processing PDF:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to process PDF" });
        }
    }
};

module.exports = sendPdf;
