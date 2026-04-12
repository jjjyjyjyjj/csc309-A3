const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createUpload = (getDir, getName, allowed) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = getDir(req);
            fs.mkdirSync(dir, { recursive: true });
            fs.readdirSync(dir).forEach(f => fs.unlinkSync(`${dir}/${f}`));
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${getName(req)}${ext}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`invalid file type`), false);
        }
    };

    return multer({ storage, fileFilter });
};

const IMAGE = ["image/jpeg", "image/png"];
const PDF   = ["application/pdf"];

module.exports = {
    uploadAvatar: createUpload(
        (req) => `uploads/${req.user.role}/${req.user.userId}/avatar/`,
        (req) => "avatar",
        IMAGE
    ),
    uploadResume: createUpload(
        (req) => `uploads/${req.user.role}/${req.user.userId}/resume/`,
        (req) => "resume",
        PDF
    ),
    uploadQualification: createUpload(
        (req) => `uploads/${req.user.role}/${req.user.userId}/qualification/${req.params.qualificationId}/`,
        (req) => "document",
        PDF
    ),
};