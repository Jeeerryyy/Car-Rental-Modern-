const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Modern Selfdrive API',
      version: '1.0.0',
      description: 'Car rental platform API for Modern Selfdrive',
      contact: {
        name: 'Kushal Parakh',
        email: 'kushalparakh@example.com'
      },
      license: {
        name: 'ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'] }
          }
        },
        Car: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            make: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'integer' },
            category: { type: 'string', enum: ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Bike', 'Scooter'] },
            transmission: { type: 'string', enum: ['Automatic', 'Manual'] },
            pricePerDay: { type: 'number' },
            status: { type: 'string', enum: ['Available', 'Rented', 'Maintenance'] }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            carId: { type: 'string' },
            pickupDate: { type: 'string', format: 'date-time' },
            dropoffDate: { type: 'string', format: 'date-time' },
            totalPrice: { type: 'number' },
            status: { type: 'string', enum: ['Upcoming', 'Active', 'Completed', 'Cancelled', 'Pending'] }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Cars', description: 'Car fleet management' },
      { name: 'Bookings', description: 'Booking management' },
      { name: 'Admin', description: 'Admin operations' },
      { name: 'Health', description: 'Health check' }
    ],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'User created' },
            400: { description: 'Validation error' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/api/cars': {
        get: {
          tags: ['Cars'],
          summary: 'List all cars',
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'transmission', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: { description: 'Success' }
          }
        }
      },
      '/api/bookings': {
        post: {
          tags: ['Bookings'],
          summary: 'Create new booking',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['carId', 'pickupDate', 'dropoffDate', 'pickupLocation', 'dropoffLocation'],
                  properties: {
                    carId: { type: 'string' },
                    pickupDate: { type: 'string', format: 'date-time' },
                    dropoffDate: { type: 'string', format: 'date-time' },
                    pickupLocation: { type: 'string' },
                    dropoffLocation: { type: 'string' },
                    driverRequired: { type: 'boolean' },
                    promoCode: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Booking created' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check endpoint',
          responses: {
            200: { description: 'Service is healthy' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Modern Selfdrive API Docs'
  }));
};

module.exports = { setupSwagger, specs };