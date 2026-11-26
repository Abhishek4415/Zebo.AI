import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
        files: 2,
        fields: 10,
        fieldSize: 100 * 1024,
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = ["application/pdf"];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error("Only PDF files are allowed!")
            );
        }

        cb(null, true);
    },
});

export default upload;