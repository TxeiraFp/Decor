const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + file.originalname;
        cb(null, unique);
    }
});

const upload = multer({ storage });

router.post("/", upload.single("image"), (req, res) => {

    console.log("UPLOAD FILE:", req.file);

    if (!req.file) {
        return res.status(400).json({
            error: "Nenhum arquivo recebido (verifique campo image)"
        });
    }

    return res.json({
        imageUrl : `${process.env.HOST_URL}/uploads/${req.file.filename}`
    });
});

module.exports = router;