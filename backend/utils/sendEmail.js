const { sendEmail, sendOtpEmail } = require('./brevoEmailService');

module.exports = sendEmail; // Re-export sendEmail for backward compatibility
module.exports.sendOtpEmail = sendOtpEmail; // Export sendOtpEmail for new usage
