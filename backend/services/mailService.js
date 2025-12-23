import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function sendMail({ to, subject, body }) {
  
  console.log("📧 Sending mail to:", to);
await transporter.sendMail({
    from: `"College Support" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text: body
  });
  
  console.log("Mail sent successfully");
}
//hostel done
//library done
//placement done
//fees done
