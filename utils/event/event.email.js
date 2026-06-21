import { EventEmitter } from "events";
import { emailsubject, sendemail } from "../email/email.ultils.js";
import { emailTemplate } from "../email/TempleteThml.js";


export const emitter = new EventEmitter();

emitter.on("confirmEmail", async (data) => {
    try {
        await sendemail({
            to: data.email,
            subject: emailsubject.confirmEmail,
            html: emailTemplate(data.email, data.otp)
        });

        console.log("Email sent successfully");
    } catch (err) {
        console.log("The Error Send email:", err);
    }
});




emitter.on("forgotPassword", async (data) => {
    try {
        await sendemail({
            to: data.email,
            subject: emailsubject.forgotPassword,
            html: emailTemplate(data.email, data.otp)
        });
        console.log("Email sent successfully");
    } catch (err) {
        console.log("The Error Send email:", err);
    }
});