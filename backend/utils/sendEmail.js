import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (email, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: "QuickCourt <onboarding@resend.dev>", // verified domain
      to: email,
      subject,
      html,
    });
    console.log("✅ Email sent via Resend:", data);
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
};
