const amqp = require('amqplib');
const logger = require('../utils/logger');
const { EmailService } = require('../services/emailService');
const config = require('../config');
const Queue = require('bull');

// Define a queue for incomplete appointment notifications
const incompleteAppointmentQueue = new Queue('incomplete-appointments', {
  redis: {
    host: config.redis.host,
    port: config.redis.port
  }
});

class QueueService {
  static connection = null;
  static channel = null;

  static async initialize() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Define queues
      await this.channel.assertQueue('notifications', { durable: true });
      await this.channel.assertQueue('incomplete_appointments', { durable: true });

      logger.info('Queue service initialized');
    } catch (error) {
      logger.error('Queue service initialization failed:', error);
      throw error;
    }
  }

  static async addToNotificationQueue(notification) {
    try {
      await this.channel.sendToQueue(
        'notifications',
        Buffer.from(JSON.stringify(notification)),
        { persistent: true }
      );
      logger.debug('Added to notification queue:', notification);
    } catch (error) {
      logger.error('Error adding to notification queue:', error);
      throw error;
    }
  }

  static async addToIncompleteAppointmentsQueue(appointment) {
    try {
      await this.channel.sendToQueue(
        'incomplete_appointments',
        Buffer.from(JSON.stringify(appointment)),
        { persistent: true }
      );
      logger.debug('Added to incomplete appointments queue:', appointment);
    } catch (error) {
      logger.error('Error adding to incomplete appointments queue:', error);
      throw error;
    }
  }

  // Function to add to the queue
  static async addToIncompleteQueue(userData, doctorData) {
    console.log('📥 Adding to incomplete queue:', {
      user: userData.email,
      doctor: doctorData.fullName
    });

    const job = await incompleteAppointmentQueue.add(
      {
        userId: userData.id,
        userEmail: userData.email,
        userName: userData.name,
        doctorId: doctorData._id,
        doctorName: doctorData.fullName,
        specialization: doctorData.specialization,
        timestamp: new Date()
      },
      {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false
      }
    );

    console.log('✅ Job added to queue:', job.id);
    return job;
  }
}

// Worker to process the queue
incompleteAppointmentQueue.process(async (job) => {
  console.log('🔄 Processing incomplete appointment job:', job.id);
  const { userEmail, userName, doctorName, specialization } = job.data;
  
  try {
    await EmailService.sendIncompleteAppointmentReminder(
      userEmail,
      {
        userName,
        doctorName,
        specialization,
        bookingLink: `${config.frontend.url}/book-appointment/${job.data.doctorId}`
      }
    );
    
    console.log(`✅ Reminder sent to ${userEmail} for Dr. ${doctorName}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending reminder:', {
      error: error.message,
      jobId: job.id,
      email: userEmail
    });
    throw error;
  }
});

// Listen for queue events
incompleteAppointmentQueue.on('completed', (job) => {
  console.log('✅ Job completed:', job.id);
});

incompleteAppointmentQueue.on('failed', (job, error) => {
  console.error('❌ Job failed:', {
    jobId: job.id,
    error: error.message
  });
});

module.exports = {
  QueueService,
  incompleteAppointmentQueue,
  addToIncompleteQueue: QueueService.addToIncompleteQueue
}; 