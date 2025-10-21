const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Explicitly set Gmail's SMTP host
    port: 587,              // Explicitly set port for STARTTLS
    secure: false,          // Use 'false' for port 587 (STARTTLS)
    requireTLS: true,       // Enforce TLS for secure connection
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: process.env.SMTP_USER, // Sender email
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