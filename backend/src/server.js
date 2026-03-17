const app = require('./app');
const { PORT } = require('./config/env');
const logger = require('./utils/logger');

app.listen(PORT, () => {
  logger.info(`🚀 SwasthyaSaathi Backend running on port ${PORT}`);
  logger.info(`📋 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`💬 Chat API: http://localhost:${PORT}/api/chat`);
});
