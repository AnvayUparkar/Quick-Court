const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log('Attempting to send email...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER ? '*****' : 'MISSING'); // Mask user for logs
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    console.log('FROM_NAME:', process.env.FROM_NAME);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // Explicitly set to false as recommended for many services (e.g., SendGrid, Resend with port 587)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    try {
        await transporter.sendMail(message);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw to be caught by catchAsync in authController
    }
};

module.exports = sendEmail;
