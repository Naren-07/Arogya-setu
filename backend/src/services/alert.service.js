const logger = require('../utils/logger');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = require('../config/env');

// ─────────────────────────────────────────────
// Mock Outbreak Alert Data
// ─────────────────────────────────────────────

const MOCK_ALERTS = [
  {
    id: 'ALERT-001',
    disease: 'Dengue',
    severity: 'high',
    icon: '🦟',
    region: 'Maharashtra, Karnataka, Tamil Nadu',
    message: '🚨 *DENGUE ALERT — High Risk*\n\nDengue cases rising in your area.\n\n*Precautions:*\n• Remove stagnant water around your home\n• Use mosquito nets and repellents\n• Wear full-sleeve clothes\n• If you have high fever + body pain + rash → visit hospital immediately\n\n*Emergency:* Call 108 for ambulance',
    active: true,
  },
  {
    id: 'ALERT-002',
    disease: 'Malaria',
    severity: 'medium',
    icon: '🦟',
    region: 'Odisha, Chhattisgarh, Jharkhand',
    message: '⚠️ *MALARIA ALERT — Moderate Risk*\n\nMalaria cases reported in nearby areas.\n\n*Precautions:*\n• Sleep under insecticide-treated bed nets\n• Use mosquito repellent cream\n• Don\'t let water collect in pots, tyres, or ditches\n• If you have fever with chills → get tested at PHC\n\n*Free testing available at government health centres*',
    active: true,
  },
  {
    id: 'ALERT-003',
    disease: 'Cholera',
    severity: 'high',
    icon: '💧',
    region: 'Bihar, West Bengal, UP',
    message: '🚨 *CHOLERA ALERT — High Risk*\n\nWater-borne disease outbreak detected.\n\n*Precautions:*\n• Drink ONLY boiled or filtered water\n• Wash hands with soap before eating\n• Avoid street food and raw vegetables\n• If you have watery diarrhea + vomiting → go to hospital NOW\n\n*Use ORS (Oral Rehydration Solution) to prevent dehydration*',
    active: true,
  },
  {
    id: 'ALERT-004',
    disease: 'COVID-19',
    severity: 'low',
    icon: '😷',
    region: 'All India',
    message: 'ℹ️ *COVID-19 UPDATE — Low Risk*\n\nCOVID cases are currently low.\n\n*Reminders:*\n• Get your booster dose if not yet taken\n• Wash hands regularly\n• Wear mask in crowded places if unwell\n• If you have persistent cough + fever + difficulty breathing → get tested',
    active: true,
  },
  {
    id: 'ALERT-005',
    disease: 'Heat Wave',
    severity: 'high',
    icon: '🌡️',
    region: 'Rajasthan, Gujarat, MP, Maharashtra',
    message: '🚨 *HEAT WAVE ALERT — Extreme Risk*\n\nTemperatures exceeding 45°C expected.\n\n*Precautions:*\n• Stay indoors between 12 PM – 4 PM\n• Drink water every 30 minutes (don\'t wait for thirst)\n• Use ORS or lemon water with salt\n• Watch for signs of heat stroke: confusion, no sweating, very high body temperature\n\n*Emergency:* Call 108 if someone collapses',
    active: false, // Seasonal
  },
];

// ─────────────────────────────────────────────
// Alert Service Functions
// ─────────────────────────────────────────────

/**
 * Get all active alerts
 * @returns {Array} Active alert objects
 */
function getActiveAlerts() {
  return MOCK_ALERTS.filter((alert) => alert.active);
}

/**
 * Get a specific alert by disease name
 * @param {string} disease - Disease name to look up
 * @returns {Object|null} Alert object or null
 */
function getAlertByDisease(disease) {
  const lowerDisease = disease.toLowerCase();
  return MOCK_ALERTS.find((a) =>
    a.disease.toLowerCase().includes(lowerDisease)
  ) || null;
}

/**
 * Format all active alerts into a single message
 * @returns {string} Formatted alerts message
 */
function formatActiveAlerts() {
  const active = getActiveAlerts();

  if (active.length === 0) {
    return '✅ *No Active Health Alerts*\n\nNo disease outbreaks currently reported in your area. Stay safe and maintain good hygiene!\n\n⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.';
  }

  let response = '🚨 *ACTIVE HEALTH ALERTS*\n\n';

  for (const alert of active) {
    const severityBadge = {
      high: '🔴 HIGH',
      medium: '🟡 MEDIUM',
      low: '🟢 LOW',
    }[alert.severity];

    response += `${alert.icon} **${alert.disease}** — ${severityBadge}\n`;
    response += `📍 ${alert.region}\n\n`;
  }

  response += '─────────────\n';
  response += 'Reply with a disease name (e.g., "dengue alert") for detailed precautions.\n\n';
  response += '⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.';

  return response;
}

/**
 * Handle an alert-related query
 * @param {string} query - User's query about alerts
 * @returns {string} Formatted alert response
 */
function handleAlertQuery(query) {
  const lowerQuery = query.toLowerCase();

  // Check if asking about a specific disease
  for (const alert of MOCK_ALERTS) {
    if (lowerQuery.includes(alert.disease.toLowerCase())) {
      return alert.message + '\n\n⚠️ *Disclaimer:* This chatbot provides general guidance only. Please consult a doctor for medical advice.';
    }
  }

  // Check for general alert keywords
  if (lowerQuery.includes('alert') || lowerQuery.includes('outbreak') || lowerQuery.includes('warning')) {
    return formatActiveAlerts();
  }

  return formatActiveAlerts();
}

/**
 * Send a proactive alert to a WhatsApp number via Twilio
 * Used for push notifications (not in webhook response flow)
 * 
 * @param {string} toNumber - WhatsApp number (whatsapp:+91XXXXXXXXXX)
 * @param {string} alertId - Alert ID to send
 * @returns {Promise<Object|null>} Twilio message result
 */
async function sendProactiveAlert(toNumber, alertId) {
  const alert = MOCK_ALERTS.find((a) => a.id === alertId);
  if (!alert) {
    logger.warn(`Alert ${alertId} not found`);
    return null;
  }

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    logger.warn('Twilio not configured — cannot send proactive alert');
    return null;
  }

  try {
    const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const result = await twilio.messages.create({
      body: alert.message,
      from: 'whatsapp:+14155238886', // Twilio sandbox
      to: toNumber,
    });

    logger.info(`Proactive alert ${alertId} sent to ${toNumber}`);
    return result;
  } catch (error) {
    logger.error(`Failed to send alert: ${error.message}`);
    return null;
  }
}

module.exports = {
  getActiveAlerts,
  getAlertByDisease,
  formatActiveAlerts,
  handleAlertQuery,
  sendProactiveAlert,
  MOCK_ALERTS,
};
