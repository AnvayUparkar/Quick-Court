const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (email, subject, htmlContent) => {
  try {
    const response = await resend.emails.send({
      from: "QuickCourt <anvay.18077@sakec.ac.in>", // verified domain
      to: email,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent via Resend:", response);
    return true;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
};

module.exports = sendEmail;