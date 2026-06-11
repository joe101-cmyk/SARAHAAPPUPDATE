import nodemailer from "nodemailer";
import { useremail, passEmail } from "../../config/config.service.js";

export async function sendemail({
    to = "",
    subject = "",
    text = "",
    html = "",
    attachments = []
}) {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: useremail,
            pass: passEmail
        }
    });

    try {

        const info = await transporter.sendMail({
            from: `"Dark Magican" <${useremail}>`,
            to,
            subject,
            text,
            html,
            attachments
        });

        console.log("Message sent:", info.messageId);

    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}

export const emailsubject = {
    confirmEmail: "confirmEmail",
    resetPassword: "resetPassword",
    welcomeEmail: "welcomeEmail",
    conectus: "conectus"
};