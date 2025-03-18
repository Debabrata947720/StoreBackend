const { PDFDocument, rgb, degrees } = require("pdf-lib");
const pdfMODel = require("../../models/Pdf");
const PurchesModel = require("../../models/Purchase");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sendPdf = async (req, res) => {
    const { ID } = req.body;

    try {
        const selectedPdf = await pdfMODel.findById(ID);
        console.log(selectedPdf);
        if (!selectedPdf) {
            return res.status(404).json({ message: "No PDFs found" });
        }

        if (selectedPdf.price !== 0) {
            return res.status(400).json({ message: "This PDF is not free" });
        }
        const response = await axios.get(selectedPdf.fileUrl, {
            responseType: "arraybuffer", // Ensure binary format
        });
        const pdfBytes = response.data
        const pdfDoc = await PDFDocument.load(pdfBytes);
        pdfDoc.setAuthor("ASIF");
        pdfDoc.setProducer("MD Asif Hossain");
        pdfDoc.setSubject(selectedPdf.title);

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
                x: 2,
                y: 2,
                size: 10,
                color: rgb(0, 0, 0),
                opacity: 0.3,
            });
        });

        const finalPdfBytes = await pdfDoc.save();

        const base64Pdf = Buffer.from(finalPdfBytes).toString("base64");

        res.json({
            message: "PDF processed successfully",
            pdf: base64Pdf, 
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
