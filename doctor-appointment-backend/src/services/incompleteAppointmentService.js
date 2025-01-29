const IncompleteAppointment = require('../models/IncompleteAppointment');
const { addToNotificationQueue } = require('./queueService');
const logger = require('../utils/logger');

class IncompleteAppointmentService {
  static async trackIncompleteAppointment(userId, doctorId, step, slotInfo = null) {
    try {
      // Find an existing incomplete appointment or create a new one
      let incomplete = await IncompleteAppointment.findOne({
        userId,
        doctorId
      });

      if (!incomplete) {
        incomplete = new IncompleteAppointment({
          userId,
          doctorId,
          lastStep: step
        });
      } else {
        incomplete.lastStep = step;
      }

      if (slotInfo) {
        incomplete.selectedSlot = slotInfo;
      }

      await incomplete.save();
      logger.debug('Incomplete appointment tracked:', { userId, doctorId, step });
    } catch (error) {
      logger.error('Error tracking incomplete appointment:', error);
    }
  }

  static async processIncompleteAppointments() {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

      // Find incomplete appointments with no notifications sent in the last 24 hours
      const incompleteAppointments = await IncompleteAppointment.find({
        $or: [
          { lastNotificationSent: { $lt: twentyFourHoursAgo } },
          { lastNotificationSent: null }
        ],
        notificationCount: { $lt: 3 }
      }).populate('userId doctorId');

      for (const appointment of incompleteAppointments) {
        await this.sendReminder(appointment);
      }

      logger.info(`Processed ${incompleteAppointments.length} incomplete appointments`);
    } catch (error) {
      logger.error('Error processing incomplete appointments:', error);
    }
  }

  static async sendReminder(appointment) {
    try {
      // Add to the notification queue
      await addToNotificationQueue({
        type: 'INCOMPLETE_APPOINTMENT_REMINDER',
        userId: appointment.userId._id,
        doctorId: appointment.doctorId._id,
        lastStep: appointment.lastStep,
        selectedSlot: appointment.selectedSlot
      });

      // Update the notification counter
      appointment.notificationCount += 1;
      appointment.lastNotificationSent = new Date();
      await appointment.save();

      logger.debug('Reminder sent for incomplete appointment:', {
        userId: appointment.userId._id,
        doctorId: appointment.doctorId._id
      });
    } catch (error) {
      logger.error('Error sending reminder:', error);
    }
  }

  static async cleanupOldRecords() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await IncompleteAppointment.deleteMany({
        createdAt: { $lt: thirtyDaysAgo }
      });
      logger.info(`Cleaned up ${result.deletedCount} old incomplete appointments`);
    } catch (error) {
      logger.error('Error cleaning up old records:', error);
    }
  }
}

module.exports = IncompleteAppointmentService; 