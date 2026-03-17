const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = require('../config/env');

/**
 * Send a WhatsApp reply via Twilio REST API
 * Used when we need to send messages outside of webhook response
 * (e.g., proactive alerts)
 */
async function sendWhatsAppReply(to, message) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn('Twilio credentials not configured. Skipping message send.');
    return null;
  }

  try {
    const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const result = await twilio.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Twilio sandbox number
      to: to,
    });

    return result;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error.message);
    throw error;
  }
}

/**
 * Format a response message with disclaimer
 */
function formatResponse(text) {
  return `${text}\n\n⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.`;
}

/**
 * Validate that required environment variables are set
 */
function validateEnv(requiredVars) {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

module.exports = { sendWhatsAppReply, formatResponse, validateEnv };
