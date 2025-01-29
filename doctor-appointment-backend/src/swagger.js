const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Doctor Appointment API',
      version: '1.0.0',
      description: 'API documentation for Doctor Appointment System'
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1'
      }
    ],
    components: {
      schemas: {
        Doctor: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d5ecb74e7d3e001f3c5b1a'
            },
            fullName: {
              type: 'string',
              example: 'Dr. John Doe'
            },
            specialization: {
              type: 'string',
              example: 'Cardiology'
            },
            rating: {
              type: 'number',
              example: 4.5
            },
            totalReviews: {
              type: 'number',
              example: 25
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  example: '123 Main St'
                },
                city: {
                  type: 'string',
                  example: 'Istanbul'
                },
                district: {
                  type: 'string',
                  example: 'Kadıköy'
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsDoc(options);