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

export const sendOtpEmail = async (to: string, otp: string) => {
    const font = "Helvetica, Arial, sans-serif";
    const html = `
    <body style="margin:0; padding:0; background-color:#f7f7f5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f5;">
            <tr>
                <td align="center" style="padding:40px 16px;">
                    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px; max-width:100%; background-color:#ffffff; border:1px solid #e4e4e0;">
                        <tr>
                            <td style="padding:24px 40px; border-bottom:1px solid #e4e4e0;">
                                <span style="font-family:${font}; font-size:18px; font-weight:700; letter-spacing:2px; color:#111111;">STAPLEHAUS</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:40px;">
                                <p style="margin:0 0 8px 0; font-family:${font}; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#76766f;">Verify your email</p>
                                <h1 style="margin:0 0 16px 0; font-family:${font}; font-size:24px; font-weight:700; color:#111111;">Confirm your account</h1>
                                <p style="margin:0 0 28px 0; font-family:${font}; font-size:15px; line-height:1.6; color:#57574f;">
                                    Enter this code to finish setting up your StapleHaus account. It expires in 10 minutes.
                                </p>
                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td align="center" style="padding:20px 0; border:1px solid #111111; background-color:#fafafa;">
                                            <span style="font-family:${font}; font-size:34px; font-weight:700; letter-spacing:12px; color:#111111;">${otp}</span>
                                        </td>
                                    </tr>
                                </table>
                                <p style="margin:28px 0 0 0; font-family:${font}; font-size:13px; line-height:1.6; color:#a6a6a0;">
                                    Didn't request this? You can safely ignore this email.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:20px 40px; border-top:1px solid #e4e4e0;">
                                <p style="margin:0; font-family:${font}; font-size:12px; color:#a6a6a0;">&copy; StapleHaus</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    `;

    const text = `Your StapleHaus verification code is ${otp}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`;

    await getTransporter().sendMail({
        from: SMTP_FROM,
        to,
        subject: `${otp} is your StapleHaus verification code`,
        text,
        html,
    });
};
