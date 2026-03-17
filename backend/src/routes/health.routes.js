const express = require('express');
const router = express.Router();

// GET /api/health — Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'swasthya-saathi-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

module.exports = router;
