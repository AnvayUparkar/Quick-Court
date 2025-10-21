const sendEmail = require("../utils/sendEmail");
const OTP = require("../models/OTP"); // Import OTP model

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

  // Basic rate limiting: prevent sending too many OTPs to the same email
  const lastOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
  if (lastOtp && (Date.now() - lastOtp.createdAt.getTime() < 60000)) { // 1 minute cooldown
    return res.status(429).json({ error: "Please wait before resending OTP" });
  }

  // Generate OTP
  const otp = generateOTP();

  try {
    // Save OTP to DB
    await OTP.create({ email, otp });

    await sendEmail({
      email,
      subject: "QuickCourt OTP",
      message: `<p>Your QuickCourt OTP is <b>${otp}</b></p>`,
    });

    return res.status(200).json({ success: true, message: "OTP sent successfully." }); // Remove `otp` from response
  } catch (err) {
    return res.status(500).json({ error: "Failed to send OTP" });
  }
}

module.exports = { sendOtpHandler };
