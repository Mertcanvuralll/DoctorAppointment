const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Doctor Appointment API Gateway',
      version: '1.0.0',
      description: 'API Documentation for Doctor Appointment System',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'Doctors', description: 'Doctor operations - Port 4001' },
      { name: 'Authentication', description: 'Auth operations - Port 4002' },
      { name: 'Appointments', description: 'Appointment operations - Port 4003' },
      { name: 'Reviews', description: 'Review operations - Port 4004' },
      { name: 'Locations', description: 'Location operations - Port 4005' },
      { name: 'Admin', description: 'Admin operations - Port 4006' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./swagger/*.yaml'] // Swagger dosyalarının yolu
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // Her IP için maksimum istek sayısı
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));
app.use(limiter);
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Routes configuration
const routes = {
  '/api/v1/doctors': {
    target: 'http://doctors-service:4001',
    pathRewrite: {
      '^/api/v1/doctors': '/api/v1/doctors'
    }
  },
  '/api/v1/auth': {
    target: 'http://auth-service:4002',
    pathRewrite: {
      '^/api/v1/auth': '/api/v1/auth'
    }
  },
  '/api/v1/appointments': {
    target: 'http://appointments-service:4003',
    pathRewrite: {
      '^/api/v1/appointments': '/api/v1/appointments'
    }
  },
  '/api/v1/reviews': {
    target: 'http://reviews-service:4004',
    pathRewrite: {
      '^/api/v1/reviews': '/api/v1/reviews'
    }
  },
  '/api/v1/locations': {
    target: 'http://locations-service:4005',
    pathRewrite: {
      '^/api/v1/locations': '/api/v1/locations'
    }
  },
  '/api/v1/admin': {
    target: 'http://admin-service:4006',
    pathRewrite: {
      '^/api/v1/admin': '/api/v1/admin'
    }
  }
};

// Setup proxy middleware
Object.entries(routes).forEach(([path, config]) => {
  app.use(path, createProxyMiddleware({
    target: config.target,
    changeOrigin: true,
    pathRewrite: config.pathRewrite,
    onProxyReq: (proxyReq, req, res) => {
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    }
  }));
});

const PORT = process.env.GATEWAY_PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
}); 