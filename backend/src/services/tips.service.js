const logger = require('../utils/logger');

// Load FAQ/tips data
const faqData = require('../data/faq.json');

/**
 * Get health tips based on category
 * 
 * @param {string} query - User's query (in English)
 * @returns {string} Formatted health tips
 */
function getHealthTips(query) {
  const lowerQuery = query.toLowerCase();

  // Determine category
  const category = classifyTipCategory(lowerQuery);
  logger.info(`Health tips category: ${category}`);

  if (category === 'all') {
    return formatAllCategories();
  }

  const tips = faqData.categories[category];
  if (!tips || tips.length === 0) {
    return formatAllCategories();
  }

  return formatTips(category, tips);
}

/**
 * Classify which category of tips to show
 */
function classifyTipCategory(query) {
  const categoryMap = {
    hygiene: ['hygiene', 'clean', 'wash', 'hand', 'sanitation', 'safai', 'hath'],
    seasonal_monsoon: ['monsoon', 'rain', 'rainy', 'barish', 'dengue', 'malaria', 'mosquito'],
    seasonal_summer: ['summer', 'heat', 'hot', 'garmi', 'dehydrat', 'sunstroke', 'loo'],
    seasonal_winter: ['winter', 'cold', 'sardi', 'thand', 'flu'],
    general: ['general', 'daily', 'health', 'healthy', 'fit', 'swasth'],
  };

  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((kw) => query.includes(kw))) {
      return category;
    }
  }

  // Default: return seasonal tips based on current month
  return getSeasonalCategory();
}

/**
 * Get seasonal category based on current month (India)
 */
function getSeasonalCategory() {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 6 && month <= 9) return 'seasonal_monsoon';
  if (month >= 3 && month <= 5) return 'seasonal_summer';
  if (month >= 11 || month <= 2) return 'seasonal_winter';

  return 'general';
}

/**
 * Format tips for a specific category
 */
function formatTips(category, tips) {
  const categoryNames = {
    hygiene: '🧼 Hygiene Tips',
    seasonal_monsoon: '🌧️ Monsoon Health Tips',
    seasonal_summer: '☀️ Summer Health Tips',
    seasonal_winter: '❄️ Winter Health Tips',
    general: '🌿 General Health Tips',
  };

  let response = `**${categoryNames[category] || '🌿 Health Tips'}**\n\n`;

  // Show high priority tips first
  const highPriority = tips.filter((t) => t.priority === 'high');
  const mediumPriority = tips.filter((t) => t.priority === 'medium');

  const orderedTips = [...highPriority, ...mediumPriority];

  orderedTips.forEach((tip, index) => {
    const icon = tip.priority === 'high' ? '🔴' : '🟡';
    response += `${index + 1}. ${icon} ${tip.tip}\n\n`;
  });

  response += `⚠️ *${faqData.disclaimer}*`;

  return response;
}

/**
 * Show all categories overview
 */
function formatAllCategories() {
  let response = '🌿 **Health Tips & Preventive Care**\n\n';
  response += 'I can share tips on:\n\n';

  response += '🧼 **Hygiene** — "Give me hygiene tips"\n';
  response += '🌧️ **Monsoon** — "Monsoon health tips"\n';
  response += '☀️ **Summer** — "Summer health advice"\n';
  response += '❄️ **Winter** — "Winter health tips"\n';
  response += '🌿 **General** — "Daily health tips"\n\n';

  // Show one random tip from the current season
  const seasonalCategory = getSeasonalCategory();
  const seasonalTips = faqData.categories[seasonalCategory];
  if (seasonalTips && seasonalTips.length > 0) {
    const randomTip = seasonalTips[Math.floor(Math.random() * seasonalTips.length)];
    response += `💡 **Tip of the day:** ${randomTip.tip}\n\n`;
  }

  response += `⚠️ *${faqData.disclaimer}*`;

  return response;
}

/**
 * Get a random daily tip
 */
function getDailyTip() {
  const allTips = Object.values(faqData.categories).flat();
  const randomIndex = Math.floor(Math.random() * allTips.length);
  return allTips[randomIndex].tip;
}

module.exports = { getHealthTips, getDailyTip };
