import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './env.js';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Modern Drive API',
      version: '2.0.0',
      description: 'Car rental platform API - Public & Owner CRM',
      contact: {
        name: 'API Support',
        email: 'support@modernselfdrive.com'
      }
    },
    servers: [
      {
        url: config.nodeEnv === 'production' 
          ? 'https://api.modernselfdrive.com' 
          : `http://localhost:${config.port}`,
        description: config.nodeEnv === 'production' ? 'Production Server' : 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'customerToken',
          description: 'Customer JWT token (HttpOnly cookie)'
        },
        ownerCookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'ownerToken',
          description: 'Owner JWT token (HttpOnly cookie)'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Invalid input',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Validation failed' }
                }
              }
            }
          }
        },
        Unauthorized: {
          description: 'Unauthorized - Invalid or missing authentication',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Not authorized' }
                }
              }
            }
          }
        },
        NotFound: {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Resource not found' }
                }
              }
            }
          }
        },
        Conflict: {
          description: 'Conflict - Resource already exists',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Email already exists' }
                }
              }
            }
          }
        }
      }
    },
    security: [{ cookieAuth: [] }]
  },
  apis: ['./src/routes/**/*.js', './src/routes/**/*.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const swaggerDocs = [
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Modern Drive API Docs',
    swaggerOptions: {
      persistAuthorization: true
    }
  })
];

export default swaggerSpec;