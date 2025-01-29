require('dotenv').config();

const config = {
  email: {
    from: process.env.SMTP_USER,
    fromName: process.env.EMAIL_FROM_NAME || 'Doctor Appointment System'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  app: {
    port: process.env.PORT || 3001
  }
};

module.exports = config; 