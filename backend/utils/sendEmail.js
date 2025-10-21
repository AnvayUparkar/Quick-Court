const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Gmail App Password
    },
  });

  const message = {
    from: process.env.SMTP_USER,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    await transporter.sendMail(message);
    console.log("✅ Email sent via Gmail SMTP:", options.subject);
  } catch (err) {
    console.error("❌ Error sending email via Gmail SMTP:", err);
    throw err;
  }
};

module.exports = sendEmail;
