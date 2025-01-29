const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const Queue = require('bull');

// Transporter for email sending
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Redis queue system
const notificationQueue = new Queue('notifications', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

class NotificationService {
  static async createNotification(data) {
    try {
      const notification = new Notification(data);
      await notification.save();

      // Add to the queue for email sending
      if (data.sendEmail) {
        await notificationQueue.add('sendEmail', {
          notificationId: notification._id
        });
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async sendAppointmentReminder(appointment) {
    const reminderData = {
      userId: appointment.patientId,
      type: 'APPOINTMENT_REMINDER',
      title: 'Appointment Reminder',
      message: `You have an appointment tomorrow at ${appointment.appointmentDate.toLocaleTimeString()}.`,
      relatedId: appointment._id,
      relatedModel: 'Appointment',
      sendEmail: true
    };

    await this.createNotification(reminderData);
  }

  static async sendIncompleteAppointmentReminder(userId, doctorId) {
    const reminderData = {
      userId,
      type: 'INCOMPLETE_APPOINTMENT',
      title: 'Incomplete Appointment',
      message: 'Would you like to complete your appointment booking?',
      relatedId: doctorId,
      relatedModel: 'Doctor',
      sendEmail: true
    };

    await this.createNotification(reminderData);
  }

  static async sendReviewRequest(appointment) {
    const requestData = {
      userId: appointment.patientId,
      type: 'REVIEW_REQUEST',
      title: 'Doctor Review',
      message: 'Would you like to review your appointment with the doctor?',
      relatedId: appointment.doctorId,
      relatedModel: 'Doctor',
      sendEmail: true
    };

    await this.createNotification(requestData);
  }

  static async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  static async getUserNotifications(userId) {
    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
  }
}

// Process email sending
notificationQueue.process('sendEmail', async (job) => {
  try {
    const notification = await Notification.findById(job.data.notificationId);
    if (!notification || notification.isEmailSent) return;

    // Send email
    await transporter.sendMail({
      to: notification.userId, // User's email address
      subject: notification.title,
      text: notification.message,
      html: `<div>
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
      </div>`
    });

    // Mark email as sent
    notification.isEmailSent = true;
    await notification.save();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
});

module.exports = NotificationService; 