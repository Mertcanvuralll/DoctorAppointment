const logger = {
  info: (message) => {
    console.log(`ℹ️ ${message}`);
  },
  success: (message) => {
    console.log(`✅ ${message}`);
  },
  error: (message, error) => {
    console.error(`❌ ${message}`, error?.message || '');
  },
  warn: (message) => {
    console.warn(`⚠️ ${message}`);
  },
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${message}`, data || '');
    }
  }
};

module.exports = logger; 