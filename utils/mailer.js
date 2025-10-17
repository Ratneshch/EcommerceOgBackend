const nodemailer = require("nodemailer");
const Verification_Email_Template = require("../utils/emailTemplate");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, otp }) => {
  try {
    await transporter.sendMail({
      from: `"Unipolar" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: Verification_Email_Template.replace("{otp}",otp),
    });
    console.log("Email sent to:", to);
  } catch (err) {
    console.error("Email sending error:", err);
  }
};

module.exports = sendMail;
