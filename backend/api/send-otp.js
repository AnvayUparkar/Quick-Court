const { sendOtpHandler } = require('../controllers/otpController');

module.exports = async (req, res) => {
  await sendOtpHandler(req, res);
};
