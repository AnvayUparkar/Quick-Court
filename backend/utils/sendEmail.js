const client = require('./emailService');
const brevo = require('@getbrevo/brevo'); // Add this line

async function sendEmail(options) {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail(); // Instantiate SendSmtpEmail
    sendSmtpEmail.to = [{ email: options.email }];
    sendSmtpEmail.sender = { email: process.env.FROM_EMAIL, name: process.env.FROM_NAME };
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.message;

    const response = await client.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully via Brevo API:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending email via Brevo API:', error);
    throw error;
  }
}

module.exports = sendEmail;
