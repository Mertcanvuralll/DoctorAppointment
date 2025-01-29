const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

// Routes
const routes = {
  auth: 'http://auth-service:3001',
  doctors: 'http://doctors-service:3002',
  appointments: 'http://appointments-service:3003'
};

// Proxy middleware
Object.entries(routes).forEach(([path, target]) => {
  app.use(`/api/v1/${path}`, createProxyMiddleware({
    target,
    changeOrigin: true
  }));
});

const PORT = process.env.GATEWAY_PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});