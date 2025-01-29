const cron = require('node-cron');
const IncompleteAppointmentService = require('../services/incompleteAppointmentService');
const logger = require('../utils/logger');

// Run at the top of every hour
cron.schedule('0 * * * *', async () => {
  logger.info('Starting incomplete appointment processing...');
  await IncompleteAppointmentService.processIncompleteAppointments();
});

// Clean up old incomplete appointments every night at midnight
cron.schedule('0 0 * * *', async () => {
  logger.info('Starting cleanup of old incomplete appointments...');
  await IncompleteAppointmentService.cleanupOldRecords();
}); 