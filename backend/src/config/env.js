require('dotenv').config();

const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const DB_URL = process.env.DB_URL || '';

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  PORT,
  GROQ_API_KEY,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  DB_URL,
  NODE_ENV,
};
