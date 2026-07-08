import nodemailer from "nodemailer";
import { HttpError } from "../errors/http-error";

export const SMTP_USER: string = process.env.SMTP_USER || "";
export const SMTP_PASS: string = process.env.SMTP_PASS || "";
export const SMTP_FROM: string = process.env.SMTP_FROM || `StapleHaus <${process.env.SMTP_USER || "no-reply@staplehaus.com"}>`;

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
    if (!SMTP_USER || !SMTP_PASS) {
        throw new HttpError(500, "Email service is not configured");
    }
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
    }
    return transporter;
};

export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
    await getTransporter().sendMail({
        from: SMTP_FROM,
        to,
        subject,
        html,
        text,
    });
};
