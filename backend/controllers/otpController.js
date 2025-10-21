const { sendEmail, sendOtpEmail } = require("../utils/sendEmail");
const OTP = require("../models/OTP"); // Import OTP model

// Simple OTP generator
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

/**
 * Generates and sends an OTP to the specified email, without sending an HTTP response.
 * @param {string} email - The recipient's email address.
 * @returns {Promise<object>} An object indicating success or failure: { success: boolean, message?: string, error?: string }.
 */
async function generateAndSendOtpLogic(email) {
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  // Basic rate limiting: prevent sending too many OTPs to the same email
  const lastOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
  if (lastOtp && (Date.now() - lastOtp.createdAt.getTime() < 60000)) { // 1 minute cooldown
    return { success: false, error: "Please wait before resending OTP" };
  }

  // Generate OTP
  const otp = generateOTP();

  try {
    // Save OTP to DB
    await OTP.create({ email, otp });

    await sendOtpEmail(email, otp); // Call sendOtpEmail with email and otp

    return { success: true, message: "OTP sent successfully." };
  } catch (err) {
    console.error("Error in generateAndSendOtpLogic:", err);
    return { success: false, error: "Failed to send OTP" };
  }
}

async function sendOtpHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  const result = await generateAndSendOtpLogic(email);

  if (result.success) {
    return res.status(200).json({ success: true, message: result.message });
  } else {
    // Handle specific rate limiting error for 429 status
    if (result.error === "Please wait before resending OTP") {
      return res.status(429).json({ error: result.error });
    } else if (result.error === "Email is required") {
        return res.status(400).json({ error: result.error });
    } 
    return res.status(500).json({ error: result.error });
  }
}

module.exports = { sendOtpHandler, generateAndSendOtpLogic };
