const sendEmail = require("../utils/sendEmail");

// Simple OTP generator
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

async function sendOtpHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // Generate OTP
  const otp = generateOTP();

  try {
    await sendEmail({
      email,
      subject: "QuickCourt OTP",
      message: `<p>Your QuickCourt OTP is <b>${otp}</b></p>`,
    });

    // Optionally, save OTP in DB or cache for verification
    // e.g., Redis or MongoDB

    return res.status(200).json({ success: true, otp }); // You can remove `otp` in production
  } catch (err) {
    return res.status(500).json({ error: "Failed to send OTP" });
  }
}

module.exports = { sendOtpHandler };
