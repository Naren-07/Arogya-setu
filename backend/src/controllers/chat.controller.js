const logger = require('../utils/logger');
const { generateResponse } = require('../services/ai.service');
const { detectLanguage, translateToEnglish, translateFromEnglish } = require('../services/translation.service');
const { lookupVaccination } = require('../services/vaccination.service');
const { getHealthTips } = require('../services/tips.service');
const { handleAlertQuery } = require('../services/alert.service');

// ─────────────────────────────────────────────
// Intent Classification
// ─────────────────────────────────────────────

const INTENT_KEYWORDS = {
  emergency: [
    'heart attack', 'chest pain', 'breathing problem', 'unconscious', 'accident',
    'bleeding heavily', 'poison', 'snake bite', 'seizure', 'stroke',
    'not breathing', 'emergency', 'dying', 'critical',
    'dil ka daura', 'saans nahi', 'behosh', 'khoon', 'zeher',
  ],
  symptom: [
    'headache', 'fever', 'cough', 'cold', 'pain', 'vomit', 'diarrhea',
    'rash', 'swelling', 'dizzy', 'nausea', 'sore throat', 'stomach',
    'infection', 'weakness', 'fatigue', 'burning', 'itching', 'ache',
    'symptom', 'sick', 'unwell', 'ill', 'feeling',
    'bukhar', 'sir dard', 'khansi', 'dard', 'ulti', 'dast',
    'sujan', 'chakkar', 'pet', 'kamzori', 'bimar',
  ],
  vaccination: [
    'vaccine', 'vaccination', 'immunization', 'immunize', 'polio',
    'bcg', 'hepatitis', 'tetanus', 'measles', 'dpt', 'booster',
    'inject', 'dose', 'baby vaccine', 'child vaccine', 'newborn',
    'tika', 'tikakaran', 'bachche ka tika',
  ],
  tips: [
    'tip', 'tips', 'advice', 'hygiene', 'prevent', 'prevention',
    'healthy', 'nutrition', 'exercise', 'diet', 'clean', 'wash',
    'seasonal', 'monsoon', 'summer', 'winter',
    'sujhav', 'safai', 'swasth',
  ],
  alert: [
    'alert', 'outbreak', 'warning', 'dengue', 'malaria', 'cholera',
    'epidemic', 'pandemic', 'disease spread', 'cases rising',
    'savdhani', 'khabar', 'chetavani',
  ],
};

/**
 * Classify intent from message text
 */
function classifyIntent(message) {
  const lowerMessage = message.toLowerCase();

  if (INTENT_KEYWORDS.emergency.some((kw) => lowerMessage.includes(kw))) return 'emergency';
  if (INTENT_KEYWORDS.alert.some((kw) => lowerMessage.includes(kw))) return 'alert';
  if (INTENT_KEYWORDS.vaccination.some((kw) => lowerMessage.includes(kw))) return 'vaccination';
  if (INTENT_KEYWORDS.tips.some((kw) => lowerMessage.includes(kw))) return 'tips';
  if (INTENT_KEYWORDS.symptom.some((kw) => lowerMessage.includes(kw))) return 'symptom';

  return 'general';
}

// ─────────────────────────────────────────────
// Core Message Processing Pipeline
// ─────────────────────────────────────────────

/**
 * Process a message through the full pipeline:
 * Detect language → Translate to English → Classify intent →
 * Route to service → Generate response → Translate back
 * 
 * @param {string} message - Raw user message
 * @param {string} [langOverride] - Override detected language (from web UI)
 * @returns {Promise<{reply: string, intent: string, language: string}>}
 */
async function processMessage(message, langOverride = null) {
  // Step 1: Detect language
  const language = langOverride || await detectLanguage(message);
  logger.info(`Language: ${language}`);

  // Step 2: Translate to English if needed
  let englishMessage = message;
  if (language !== 'en') {
    englishMessage = await translateToEnglish(message, language);
    logger.info(`Translated to English: "${englishMessage}"`);
  }

  // Step 3: Classify intent (on English text for accuracy)
  const intent = classifyIntent(englishMessage);
  logger.info(`Intent: ${intent}`);

  // Step 4: Route to appropriate service
  let reply;
  switch (intent) {
    case 'vaccination':
      // Use static data lookup (no AI call needed)
      reply = lookupVaccination(englishMessage);
      break;

    case 'tips':
      // Use curated tips data
      reply = getHealthTips(englishMessage);
      break;

    case 'alert':
      // Use mock alert data (no AI call needed)
      reply = handleAlertQuery(englishMessage);
      break;

    case 'emergency':
    case 'symptom':
    case 'general':
    default:
      // Use Groq AI for dynamic responses
      reply = await generateResponse(englishMessage, intent);
      break;
  }

  // Step 5: Translate response back to user's language
  if (language !== 'en') {
    reply = await translateFromEnglish(reply, language);
    logger.info(`Translated reply to ${language}`);
  }

  return { reply, intent, language };
}

// ─────────────────────────────────────────────
// Route Handlers
// ─────────────────────────────────────────────

/**
 * Handle direct API chat messages (web interface)
 * POST /api/chat
 */
async function handleMessage(req, res, next) {
  try {
    const { message, language = null } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required',
        hint: 'Send a JSON body with a "message" field',
      });
    }

    logger.info(`Web chat: "${message}"`);

    const result = await processMessage(message, language !== 'en' ? language : null);

    res.json({
      success: true,
      reply: result.reply,
      intent: result.intent,
      language: result.language,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle WhatsApp messages from Twilio webhook
 * POST /api/chat/whatsapp
 */
async function handleWhatsAppMessage(req, res, next) {
  try {
    const { Body: messageBody, From: from } = req.body;

    logger.info(`WhatsApp from ${from}: "${messageBody}"`);

    if (!messageBody) {
      return res.status(400).send('No message body received');
    }

    // Process through full pipeline (auto-detect language)
    const result = await processMessage(messageBody);

    // TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(result.reply)}</Message>
</Response>`;

    res.set('Content-Type', 'text/xml');
    res.send(twiml);

    logger.info(`WhatsApp reply → ${from} (intent: ${result.intent}, lang: ${result.language})`);
  } catch (error) {
    next(error);
  }
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = { handleMessage, handleWhatsAppMessage, classifyIntent, processMessage };
