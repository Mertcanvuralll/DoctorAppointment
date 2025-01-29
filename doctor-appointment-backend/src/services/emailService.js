const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('SMTP connection error:', error);
      } else {
        logger.info('SMTP server is ready to send emails');
      }
    });
  }

  async sendReviewRequest(email, appointmentId, doctorName) {
    try {
      console.log('📧 Starting review email process:', {
        email,
        appointmentId,
        doctorName
      });

      if (!email || typeof email !== 'string') {
        console.error('❌ Invalid email parameter:', email);
        throw new Error('Valid email address is required');
      }

      const reviewLink = `${process.env.FRONTEND_URL}/review/${appointmentId}`;
      console.log('🔗 Generated review link:', reviewLink);

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email.trim(),
        subject: 'Please Rate Your Doctor Visit',
        html: this.getReviewTemplate(doctorName, reviewLink)
      };

      console.log('📝 Mail options prepared:', mailOptions);

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Review email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error in sendReviewRequest:', {
        error: error.message,
        stack: error.stack,
        emailDetails: { email, appointmentId, doctorName }
      });
      throw error;
    }
  }

  getReviewTemplate(doctorName, reviewLink) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h2 style="color: #1976d2; margin-bottom: 20px;">How was your visit with Dr. ${doctorName}?</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Your feedback is important to us! Please take a moment to rate your experience.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${reviewLink}" 
              style="
                background-color: #1976d2;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;
                font-weight: bold;
              "
            >
              Rate Your Visit
            </a>
          </div>
        </div>
      </div>
    `;
  }

  static async getTemplate(templateName) {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
    const template = await fs.readFile(templatePath, 'utf-8');
    return handlebars.compile(template);
  }

  static async sendEmail({ to, subject, template, context }) {
    try {
      const compiledTemplate = await this.getTemplate(template);
      const html = compiledTemplate(context);

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.debug('Email sent:', info.messageId);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  static async sendAppointmentReminder(data) {
    try {
      logger.info('Appointment reminder email would be sent:', data);
      return true;
    } catch (error) {
      logger.error('Error sending reminder email:', error);
      return false;
    }
  }

  static generateGoogleCalendarLink(appointment) {
    const { doctor, date, time } = appointment;
    const startDate = new Date(`${date}T${time}`);
    const endDate = new Date(startDate.getTime() + 30 * 60000);

    const event = {
      text: `Appointment with Dr. ${doctor.fullName}`,
      dates: `${startDate.toISOString()}/${endDate.toISOString()}`,
      location: `${doctor.address.city}, ${doctor.address.district}`,
      details: `Your appointment with Dr. ${doctor.fullName} (${doctor.specialization})`
    };

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.text)}&dates=${event.dates.replace(/[-:]/g, '')}&location=${encodeURIComponent(event.location)}&details=${encodeURIComponent(event.details)}`;
  }

  async sendIncompleteAppointmentReminder(email, { userName, doctorName, specialization, bookingLink }) {
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Complete Your Doctor Appointment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hello ${userName},</h2>
          <p>We noticed you were interested in booking an appointment with Dr. ${doctorName} (${specialization}).</p>
          <p>Would you like to complete your appointment booking?</p>
          <div style="margin: 30px 0;">
            <a href="${bookingLink}" 
               style="background-color: #1976d2; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Complete Booking
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you no longer wish to book this appointment, you can ignore this email.
          </p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService(); 