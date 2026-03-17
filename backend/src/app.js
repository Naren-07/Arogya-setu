const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat.routes');
const healthRoutes = require('./routes/health.routes');
const alertRoutes = require('./routes/alert.routes');
const errorMiddleware = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const { PORT, FRONTEND_URL } = require('./config/env');

const app = express();

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/alerts', alertRoutes);

// Error handling
app.use(errorMiddleware);

module.exports = app;
