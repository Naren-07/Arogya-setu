const path = require('path');
const logger = require('../utils/logger');

// Load vaccination data
const vaccinationData = require('../data/vaccination.json');

/**
 * Look up vaccination information based on user query
 * 
 * @param {string} query - User's query (in English)
 * @returns {string} Formatted vaccination information
 */
function lookupVaccination(query) {
  const lowerQuery = query.toLowerCase();

  // Check if asking about child/baby vaccines
  if (isChildVaccineQuery(lowerQuery)) {
    return formatChildVaccines(lowerQuery);
  }

  // Check if asking about adult vaccines
  if (isAdultVaccineQuery(lowerQuery)) {
    return formatAdultVaccines();
  }

  // Check for specific vaccine name
  const specificVaccine = findSpecificVaccine(lowerQuery);
  if (specificVaccine) {
    return specificVaccine;
  }

  // General vaccination info
  return formatGeneralVaccinationInfo();
}

/**
 * Check if query is about child vaccines
 */
function isChildVaccineQuery(query) {
  const childKeywords = [
    'baby', 'child', 'infant', 'newborn', 'kid', 'toddler',
    'month', 'weeks', 'birth', 'bachcha', 'bacche', 'shishu',
  ];
  return childKeywords.some((kw) => query.includes(kw));
}

/**
 * Check if query is about adult vaccines
 */
function isAdultVaccineQuery(query) {
  const adultKeywords = ['adult', 'elderly', 'pregnant', 'old', 'senior'];
  return adultKeywords.some((kw) => query.includes(kw));
}

/**
 * Format child vaccine schedule — optionally filter by age
 */
function formatChildVaccines(query) {
  let vaccines = vaccinationData.child_vaccines;

  // Try to extract age from query
  const ageMatch = query.match(/(\d+)\s*(month|week|year)/i);
  if (ageMatch) {
    const ageNum = parseInt(ageMatch[1]);
    const ageUnit = ageMatch[2].toLowerCase();

    // Filter to relevant vaccines
    if (ageUnit === 'month' || ageUnit === 'week') {
      vaccines = filterByAge(vaccines, ageNum, ageUnit);
    }
  }

  let response = '💉 **Child Vaccination Schedule**\n\n';

  for (const entry of vaccines) {
    response += `📌 **Age: ${entry.age}**\n`;
    response += `   Vaccines: ${entry.vaccines.join(', ')}\n`;
    if (entry.notes) {
      response += `   ℹ️ ${entry.notes}\n`;
    }
    response += '\n';
  }

  response += `📋 *Source: ${vaccinationData.source}*\n\n`;
  response += `⚠️ *${vaccinationData.disclaimer}*`;

  return response;
}

/**
 * Filter child vaccines by approximate age
 */
function filterByAge(vaccines, ageNum, ageUnit) {
  // Convert to approximate weeks for comparison
  const ageInWeeks = ageUnit === 'month' ? ageNum * 4.3 : ageNum;

  return vaccines.filter((v) => {
    const ageStr = v.age.toLowerCase();
    if (ageStr === 'birth') return ageInWeeks < 2;
    if (ageStr.includes('week')) {
      const weeks = parseInt(ageStr);
      return Math.abs(weeks - ageInWeeks) <= 4;
    }
    if (ageStr.includes('month')) {
      const months = parseInt(ageStr);
      return Math.abs(months * 4.3 - ageInWeeks) <= 8;
    }
    return true; // Include if can't parse
  });
}

/**
 * Format adult vaccine information
 */
function formatAdultVaccines() {
  let response = '💉 **Adult Vaccination Information**\n\n';

  for (const entry of vaccinationData.adult_vaccines) {
    response += `📌 **${entry.vaccine}**\n`;
    response += `   Who: ${entry.who}\n`;
    response += `   Frequency: ${entry.frequency}\n\n`;
  }

  response += `📋 *Source: ${vaccinationData.source}*\n\n`;
  response += `⚠️ *${vaccinationData.disclaimer}*`;

  return response;
}

/**
 * Search for a specific vaccine by name
 */
function findSpecificVaccine(query) {
  const allVaccines = [];

  // Collect all child vaccines
  for (const entry of vaccinationData.child_vaccines) {
    for (const vaccine of entry.vaccines) {
      allVaccines.push({
        name: vaccine,
        age: entry.age,
        notes: entry.notes,
        type: 'child',
      });
    }
  }

  // Collect adult vaccines
  for (const entry of vaccinationData.adult_vaccines) {
    allVaccines.push({
      name: entry.vaccine,
      who: entry.who,
      frequency: entry.frequency,
      type: 'adult',
    });
  }

  // Search
  const matches = allVaccines.filter((v) =>
    query.includes(v.name.toLowerCase())
  );

  if (matches.length === 0) return null;

  let response = `💉 **Vaccine Information: ${matches[0].name}**\n\n`;

  for (const match of matches) {
    if (match.type === 'child') {
      response += `📌 Given at age: ${match.age}\n`;
      if (match.notes) response += `ℹ️ ${match.notes}\n`;
    } else {
      response += `📌 Who: ${match.who}\n`;
      response += `📅 Frequency: ${match.frequency}\n`;
    }
    response += '\n';
  }

  response += `⚠️ *${vaccinationData.disclaimer}*`;
  return response;
}

/**
 * Format general vaccination information
 */
function formatGeneralVaccinationInfo() {
  return `💉 **Vaccination Information**

I can help you with:

1. **Child Vaccination Schedule** — Ask \"What vaccines does my 6-month baby need?\"
2. **Adult Vaccines** — Ask \"What vaccines do adults need?\"
3. **Specific Vaccine** — Ask \"Tell me about BCG vaccine\"

💡 *Tip: Visit your nearest Primary Health Centre (PHC) or government hospital for free vaccinations under the Universal Immunization Programme.*

⚠️ *${vaccinationData.disclaimer}*`;
}

module.exports = { lookupVaccination };
