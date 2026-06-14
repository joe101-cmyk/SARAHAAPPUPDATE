import fs from "fs";
import path from "path";

export const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export const deleteFileByFullPath = (fullPath) => {
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export const getFileNameFromPath = (filePath) => {
  return path.basename(filePath);
};

export const getUploadPath = (userId, customPath = "users") => {
  return `uploads/${customPath}/${userId}`;
};
