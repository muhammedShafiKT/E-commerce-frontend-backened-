import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    console.log("FILE RECEIVED:", file); 
    cb(null, true);
  }
});

export default upload;