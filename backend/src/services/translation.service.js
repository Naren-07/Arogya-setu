const Groq = require('groq-sdk');
const { GROQ_API_KEY } = require('../config/env');
const logger = require('../utils/logger');

// Use the same Groq client for translation
const groq = new Groq({ apiKey: GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Detect the language of a text message
 * Uses Groq/Llama for accurate detection of English, Hindi, and Marathi
 * 
 * @param {string} text - Input text
 * @returns {Promise<string>} Language code: 'en', 'hi', 'mr', or 'unknown'
 */
async function detectLanguage(text) {
  // Quick heuristic check first (avoids API call for obvious cases)
  const quickDetect = quickLanguageDetect(text);
  if (quickDetect !== 'unknown') {
    logger.debug(`Language detected (heuristic): ${quickDetect}`);
    return quickDetect;
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a language detector. Respond with ONLY the language code: "en" for English, "hi" for Hindi, "mr" for Marathi. Nothing else. Just the 2-letter code.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      model: MODEL,
      temperature: 0,
      max_tokens: 5,
    });

    const detected = response.choices[0]?.message?.content?.trim().toLowerCase();

    if (['en', 'hi', 'mr'].includes(detected)) {
      logger.info(`Language detected (AI): ${detected}`);
      return detected;
    }

    return 'en'; // Default to English
  } catch (error) {
    logger.error(`Language detection error: ${error.message}`);
    return 'en'; // Default to English on error
  }
}

/**
 * Quick heuristic language detection using Unicode ranges
 * Avoids API call for obvious cases
 */
function quickLanguageDetect(text) {
  // Count Devanagari characters (used by Hindi and Marathi)
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;

  if (totalChars === 0) return 'en';

  const devanagariRatio = devanagariCount / totalChars;
  const latinRatio = latinCount / totalChars;

  // If >40% Devanagari script → Hindi or Marathi (default to Hindi)
  if (devanagariRatio > 0.4) {
    return 'hi'; // Could be Marathi too, but Hindi is more common for target users
  }

  // If >60% Latin → English
  if (latinRatio > 0.6) {
    return 'en';
  }

  // Mixed or unclear → let AI decide
  return 'unknown';
}

/**
 * Translate text from one language to another using Groq/Llama
 * 
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language code ('en', 'hi', 'mr')
 * @param {string} toLang - Target language code ('en', 'hi', 'mr')
 * @returns {Promise<string>} Translated text
 */
async function translateText(text, fromLang, toLang) {
  // Skip if same language
  if (fromLang === toLang) return text;

  const langNames = {
    en: 'English',
    hi: 'Hindi',
    mr: 'Marathi',
  };

  const fromName = langNames[fromLang] || 'English';
  const toName = langNames[toLang] || 'English';

  try {
    logger.info(`Translating: ${fromName} → ${toName}`);

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a precise translator for healthcare communication in India.

RULES:
1. Translate from ${fromName} to ${toName}
2. Use SIMPLE, everyday language (target audience: rural India, low literacy)
3. Keep medical terms understandable — do NOT use complex medical jargon
4. Preserve formatting (bullet points, emojis, line breaks)
5. Preserve the disclaimer text if present
6. Do NOT add any extra commentary — only output the translated text
7. If a word has no good translation, keep it in the original language`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      model: MODEL,
      temperature: 0.2, // Low for accurate translations
      max_tokens: 1500,
    });

    const translated = response.choices[0]?.message?.content?.trim();

    if (!translated) {
      logger.warn('Empty translation response — returning original text');
      return text;
    }

    logger.info(`Translation complete (${translated.length} chars)`);
    return translated;
  } catch (error) {
    logger.error(`Translation error: ${error.message}`);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Translate user input to English for AI processing
 * @param {string} text - User's message
 * @param {string} detectedLang - Detected language code
 * @returns {Promise<string>} English text
 */
async function translateToEnglish(text, detectedLang) {
  if (detectedLang === 'en') return text;
  return translateText(text, detectedLang, 'en');
}

/**
 * Translate AI response back to user's language
 * @param {string} text - AI response in English
 * @param {string} targetLang - User's language code
 * @returns {Promise<string>} Translated response
 */
async function translateFromEnglish(text, targetLang) {
  if (targetLang === 'en') return text;
  return translateText(text, 'en', targetLang);
}

module.exports = {
  detectLanguage,
  translateText,
  translateToEnglish,
  translateFromEnglish,
  quickLanguageDetect,
};
