const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// POST /api/chat — Process a chat message
router.post('/', chatController.handleMessage);

// POST /api/chat/whatsapp — Process incoming WhatsApp message from Twilio
router.post('/whatsapp', chatController.handleWhatsAppMessage);

module.exports = router;
