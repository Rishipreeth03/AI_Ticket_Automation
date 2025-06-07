import nodemailer from "nodemailer";

export const sendMail=async(to,subject,text)=>{
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_SMTP_HOST,
            port: process.env.MAILTRAP_SMTP_PORT,
            auth: {
              user: process.env.MAILTRAP_SMTP_USER,
              pass: process.env.MAILTRAP_SMTP_PASS,
            },
          });
          
            const info = await transporter.sendMail({
              from: '"Ingest TMS',
              to,
              subject,
              text, // plain‑text body
            });
          
            console.log("Message sent:", info.messageId);
            return info
             
    } catch (error) {
        console.log("Mail Error",error.message)
        throw error
    }
}