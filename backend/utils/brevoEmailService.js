const brevo = require('@getbrevo/brevo');
require('dotenv').config({ path: './.env' }); // Load environment variables from .env file

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

// Ensure sender email and name are configured
const FROM_EMAIL = process.env.FROM_EMAIL;
const FROM_NAME = process.env.FROM_NAME;

if (!FROM_EMAIL || !FROM_NAME) {
    console.error('❌ Brevo sender email (FROM_EMAIL) or name (FROM_NAME) not configured in environment variables.');
    // Depending on your application's error handling, you might want to throw an error here
    // or set default values, but for transactional emails, a proper sender is critical.
}

/**
 * Sends a general transactional email using Brevo.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} htmlContent - The HTML content of the email.
 */
async function sendEmail(to, subject, htmlContent) {
    try {
        if (!FROM_EMAIL) {
            throw new Error('FROM_EMAIL is not configured. Cannot send email.');
        }

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.sender = { email: FROM_EMAIL, name: FROM_NAME || 'QuickCourt' };
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ General email sent successfully via Brevo API:', response);
        return response;
    } catch (error) {
        console.error('❌ Error sending general email via Brevo API:', error);
        throw error;
    }
}

/**
 * Sends an OTP (One-Time Password) email to the recipient.
 * @param {string} to - The recipient's email address.
 * @param {string} otp - The One-Time Password to be sent.
 */
async function sendOtpEmail(to, otp) {
    try {
        if (!FROM_EMAIL) {
            throw new Error('FROM_EMAIL is not configured. Cannot send OTP email.');
        }

        const otpHtmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>One-Time Password (OTP) for QuickCourt</h2>
                <p>Use this OTP to complete your signup. This code will expire in 10 minutes.</p>
                <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px;">
                    <h3 style="color: #007bff; font-size: 24px; margin: 0;">${otp}</h3>
                </div>
                <p>If you did not request this, please ignore this email.</p>
                <p>Thank you,<br/>The QuickCourt Team</p>
            </div>
        `;

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.sender = { email: FROM_EMAIL, name: FROM_NAME || 'QuickCourt' };
        sendSmtpEmail.subject = 'Your QuickCourt One-Time Password (OTP)';
        sendSmtpEmail.htmlContent = otpHtmlContent;

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ OTP email sent successfully via Brevo API:', response);
        return response;
    } catch (error) {
        console.error('❌ Error sending OTP email via Brevo API:', error);
        throw error;
    }
}

module.exports = {
    sendEmail,
    sendOtpEmail
};

/*
// Example Usage (for testing purposes, uncomment and run in a separate script or directly)
(async () => {
    // Make sure your .env file has BREVO_API_KEY, FROM_EMAIL, FROM_NAME
    // process.env.BREVO_API_KEY = 'YOUR_BREVO_API_KEY';
    // process.env.FROM_EMAIL = 'your_verified_email@example.com';
    // process.env.FROM_NAME = 'QuickCourt App';

    try {
        // Example: Sending a general email
        // await sendEmail(
        //     'recipient@example.com',
        //     'Welcome to QuickCourt!',
        //     '<h1>Hello from QuickCourt!</h1><p>We are glad to have you.</p>'
        // );

        // Example: Sending an OTP email
        // await sendOtpEmail(
        //     'recipient@example.com',
        //     '123456'
        // );
    } catch (error) {
        console.error('Example usage failed:', error);
    }
})();
*/
