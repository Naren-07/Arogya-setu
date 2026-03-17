const express = require('express');
const router = express.Router();
const { getActiveAlerts, sendProactiveAlert, MOCK_ALERTS } = require('../services/alert.service');
const logger = require('../utils/logger');

// GET /api/alerts — List all active alerts
router.get('/', (req, res) => {
  const alerts = getActiveAlerts();
  res.json({
    success: true,
    count: alerts.length,
    alerts: alerts.map((a) => ({
      id: a.id,
      disease: a.disease,
      severity: a.severity,
      region: a.region,
      icon: a.icon,
    })),
  });
});

// GET /api/alerts/all — List all alerts (including inactive)
router.get('/all', (req, res) => {
  res.json({
    success: true,
    count: MOCK_ALERTS.length,
    alerts: MOCK_ALERTS.map((a) => ({
      id: a.id,
      disease: a.disease,
      severity: a.severity,
      region: a.region,
      active: a.active,
    })),
  });
});

// POST /api/alerts/send — Send a proactive alert via WhatsApp
router.post('/send', async (req, res) => {
  const { alertId, toNumber } = req.body;

  if (!alertId || !toNumber) {
    return res.status(400).json({
      error: 'alertId and toNumber are required',
      hint: 'toNumber format: whatsapp:+91XXXXXXXXXX',
    });
  }

  logger.info(`Sending alert ${alertId} to ${toNumber}`);

  const result = await sendProactiveAlert(toNumber, alertId);

  if (result) {
    res.json({ success: true, messageSid: result.sid });
  } else {
    res.status(500).json({ success: false, error: 'Failed to send alert' });
  }
});

module.exports = router;
