import multer from "multer";
import path from "path";
import fs from "fs";

export const localmulter = (customPath = "Message") => {
  const basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let userPath = basePath;

      if (req.user?._id) {
        userPath = `${basePath}/${req.user._id}`;
      }

      const fullPath = path.join(process.cwd(), userPath);

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      cb(null, fullPath);
    },

    filename: (req, file, cb) => {
      const uniqueFile = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;

      cb(null, uniqueFile);
    },
  });

  return multer({ storage });
};