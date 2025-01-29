const Redis = require('ioredis');

let monitor = null;

const initMonitor = () => {
  if (monitor) return;

  monitor = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 1
  });

  monitor.on('connect', () => {
    console.log('Redis Monitor: Connected');
  });

  monitor.on('error', (err) => {
    console.error('Redis Monitor Error:', err);
  });

  monitor.on('close', () => {
    console.log('Redis Monitor: Connection closed');
    monitor = null;
  });

  monitor.monitor((err, monitor) => {
    if (err) {
      console.error('Redis Monitor Setup Error:', err);
      return;
    }
    console.log('Redis Monitor: Entering monitoring mode...');
  });
};

process.on('SIGINT', () => {
  if (monitor) {
    monitor.disconnect();
  }
  process.exit();
});

module.exports = { initMonitor }; 