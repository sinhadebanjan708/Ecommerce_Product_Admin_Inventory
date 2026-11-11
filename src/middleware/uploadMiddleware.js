
const fs = require("fs");
const multer = require("multer");
const path = require("path");

// IMPORTANT: Assuming middleware is inside src/middlewares
const uploadDir = path.resolve(__dirname, "../../uploads");

const folders = [
    "category",
    "subcategory",
    "product",
    "productvariant"
];

// Create all folders inside project-root/uploads
folders.forEach((folder) => {
    const folderPath = path.join(uploadDir, folder);

    fs.mkdirSync(folderPath, { recursive: true });

    console.log("Upload folder:", folderPath);
});

// Dynamic storage
const createStorage = (folderName) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const destination = path.join(uploadDir, folderName);

            // Ensure destination exists before saving
            fs.mkdirSync(destination, { recursive: true });

            console.log("Saving image to:", destination);

            cb(null, destination);
        },

        filename: (req, file, cb) => {
            const uniqueName =
                Date.now() +
                "-" +
                Math.round(Math.random() * 1E9) +
                path.extname(file.originalname);

            cb(null, uniqueName);
        }
    });
};

const createUpload = (folderName) => {
    return multer({
        storage: createStorage(folderName),
        limits: {
            fileSize: 5 * 1024 * 1024
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error("Only JPG, PNG and WEBP images are allowed"));
            }
        }
    });
};

module.exports = {
    categoryUpload: createUpload("category"),
    subcategoryUpload: createUpload("subcategory"),
    productUpload: createUpload("product"),
    productVariantUpload: createUpload("productvariant")
};
