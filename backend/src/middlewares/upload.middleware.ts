import fs from "fs";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const allowedImageMessage = "Only JPG, JPEG, PNG, WEBP, GIF, and AVIF image files are allowed";

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadDir);
    },
    filename: function (_req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeFieldName = file.fieldname.replace(/[^a-z0-9_-]/gi, "-");
        cb(null, `${safeFieldName}-${randomUUID()}${extension}`);
    }
});

const imageFileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isAllowedMimeType = file.mimetype.startsWith("image/");
    const isAllowedExtension = allowedImageExtensions.has(extension);

    if (!isAllowedMimeType || !isAllowedExtension) {
        return cb(new Error(allowedImageMessage));
    }

    cb(null, true);
}

const imageUpload = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export const uploads = {
    single: (fieldName: string) => imageUpload.single(fieldName),
    array: (fieldName: string, maxCount: number) => imageUpload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => imageUpload.fields(fieldsArray),
}

export { uploadDir, imageUpload, allowedImageMessage };
