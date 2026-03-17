const Groq = require('groq-sdk');
const { GROQ_API_KEY } = require('../config/env');
const { SYSTEM_PROMPT, FEW_SHOT_EXAMPLES } = require('../../../shared/constants/prompts');
const logger = require('../utils/logger');

// Initialize Groq client
const groq = new Groq({ apiKey: GROQ_API_KEY });

// Model to use — Llama 3 on Groq is fast and free-tier friendly
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate a health-aware AI response using Groq API
 * 
 * @param {string} userMessage - The user's message (already in English)
 * @param {string} intent - Classified intent (symptom, vaccination, tips, alert, general)
 * @returns {Promise<string>} AI-generated response
 */
async function generateResponse(userMessage, intent = 'general') {
  try {
    // Build messages array with system prompt and few-shot examples
    const messages = [
      {
        role: 'system',
        content: buildSystemPrompt(intent),
      },
    ];

    // Add few-shot examples for better response quality
    for (const example of FEW_SHOT_EXAMPLES) {
      messages.push({ role: 'user', content: example.user });
      messages.push({ role: 'assistant', content: example.assistant });
    }

    // Add the actual user message
    messages.push({ role: 'user', content: userMessage });

    logger.info(`Calling Groq API (model: ${MODEL}, intent: ${intent})`);

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: MODEL,
      temperature: 0.3, // Low temperature for consistent medical responses
      max_tokens: 1024,
      top_p: 0.9,
      stream: false,
    });

    const response = chatCompletion.choices[0]?.message?.content;

    if (!response) {
      logger.warn('Empty response from Groq API');
      return getFallbackResponse(intent);
    }

    // Ensure disclaimer is present
    if (!response.includes('Disclaimer') && !response.includes('disclaimer') && !response.includes('consult a doctor')) {
      return response + '\n\n⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.';
    }

    logger.info('Groq API response received successfully');
    return response;
  } catch (error) {
    logger.error(`Groq API error: ${error.message}`);

    // Handle specific error cases
    if (error.status === 429) {
      logger.warn('Groq rate limit hit — using fallback response');
      return getFallbackResponse(intent);
    }

    if (error.status === 401) {
      logger.error('Invalid Groq API key');
      return '❌ Configuration error. Please contact the administrator.\n\n⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.';
    }

    return getFallbackResponse(intent);
  }
}

/**
 * Build an intent-aware system prompt
 */
function buildSystemPrompt(intent) {
  let contextAddition = '';

  switch (intent) {
    case 'symptom':
      contextAddition = `
The user is asking about symptoms. Provide:
1. 2-3 possible common causes
2. Basic home care suggestions specific to rural India
3. Clear red flags for when to see a doctor
4. The mandatory disclaimer`;
      break;

    case 'vaccination':
      contextAddition = `
The user is asking about vaccinations. Provide:
1. Relevant vaccine information based on their query
2. Recommended age/schedule if applicable
3. Where to get vaccinated (local PHC, government hospital)
4. The mandatory disclaimer`;
      break;

    case 'tips':
      contextAddition = `
The user is asking for health tips. Provide:
1. Practical, actionable health advice for rural Indian context
2. Simple language anyone can understand
3. Seasonal relevance if applicable
4. The mandatory disclaimer`;
      break;

    case 'emergency':
      contextAddition = `
⚠️ The user may be describing an EMERGENCY. 
1. IMMEDIATELY recommend calling 108 (ambulance) or going to nearest hospital
2. Provide basic first-aid steps if applicable
3. Do NOT minimize the situation
4. Include the mandatory disclaimer`;
      break;

    default:
      contextAddition = '\nProvide helpful, simple health information.';
  }

  return SYSTEM_PROMPT + contextAddition;
}

/**
 * Return a safe fallback response when AI is unavailable
 */
function getFallbackResponse(intent) {
  const fallbacks = {
    symptom: `I'm sorry, I'm having trouble connecting right now. For your symptoms:

1. 🏥 If symptoms are severe, please visit your nearest health center or call 108
2. 💊 Rest, drink plenty of fluids, and eat light meals
3. 🌡️ Monitor your temperature regularly

⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.`,

    vaccination: `I'm sorry, I'm having trouble connecting right now. For vaccination queries:

1. 💉 Visit your nearest Primary Health Centre (PHC) for vaccination
2. 📋 Carry your child's vaccination card
3. 📞 Call your local ASHA worker for schedule information

⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.`,

    tips: `Here's a general health tip:

🧼 Wash your hands with soap for 20 seconds before eating and after using the toilet. This simple habit prevents many diseases!

⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.`,

    emergency: `🚨 If this is an emergency:

1. Call 108 for an ambulance IMMEDIATELY
2. Go to the nearest hospital
3. Call your local doctor

⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.`,

    general: `I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.

For urgent health concerns, visit your nearest health center or call 108.

⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.`,
  };

  return fallbacks[intent] || fallbacks.general;
}

module.exports = { generateResponse, getFallbackResponse };
