import crypto from "crypto";
import { Encryption_Secret_Keys } from "../../config/config.service.js";

const IV_LENGTH = 16;

if (!Encryption_Secret_Keys || Encryption_Secret_Keys.length !== 64) {
    throw new Error("Invalid ENCRYPTION_SECRET_KEY: must be a 64-char hex string (32 bytes)");
}

const Encryption_Secret = Buffer.from(Encryption_Secret_Keys, 'hex');

export const encrypt = (txt) => {
    if (!txt || typeof txt !== "string") {
        throw new Error("encrypt: input must be a non-empty string");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Encryption_Secret, iv);

    let encrypted = cipher.update(txt, "utf-8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (encryptedData) => {
    if (!encryptedData || !encryptedData.includes(":")) {
        throw new Error("decrypt: invalid encrypted data format");
    }

    const [ivHex, encryptedTxt] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", Encryption_Secret, iv);

    let decrypted = decipher.update(encryptedTxt, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
};