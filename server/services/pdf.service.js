import { PDFParse } from "pdf-parse";

export const extractPdfText = async (fileBuffer) => {

    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
        throw new Error("PDF file buffer is missing.");
    }

    // Basic PDF signature validation
    if (fileBuffer.subarray(0, 5).toString() !== "%PDF-") {
        throw new Error("Invalid PDF file.");
    }

    const parser = new PDFParse({
        data: fileBuffer,
    });

    try {
        const result = await parser.getText();

        const text = result.text?.trim();

        if (!text) {
            throw new Error(
                "No readable text found in the PDF."
            );
        }

        if (text.length > 50000) {
            throw new Error("Document contains too much text.");
        }

        return text;

    } catch (error) {
        console.error("PDF extraction error:", error.message);
        throw error;

    } finally {
        await parser.destroy();
    }
};