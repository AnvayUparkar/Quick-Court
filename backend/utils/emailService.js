const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

module.exports = apiInstance;
