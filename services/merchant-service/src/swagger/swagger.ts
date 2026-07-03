import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Merchant Service API',
    version: '1.0.0',
    description: 'API for Merchant Onboarding, Authentication, and Dashboard Analytics',
  },
  servers: [
    {
      url: 'http://localhost:3001/api/v1',
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new merchant',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  businessName: { type: 'string' },
                  businessUrl: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Merchant registered successfully' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login as a merchant',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
        },
      },
    },
    '/api-keys': {
      post: {
        summary: 'Generate a new API Key',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  mode: { type: 'string', enum: ['test', 'live'] },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'API Key generated' },
        },
      },
      get: {
        summary: 'List API Keys',
        responses: {
          200: { description: 'List of API Keys' },
        },
      },
    },
    '/api-keys/{id}/revoke': {
      post: {
        summary: 'Revoke an API Key',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'API Key revoked' },
        },
      },
    },
    '/dashboard/profile': {
      get: {
        summary: 'Get Merchant Profile',
        responses: {
          200: { description: 'Merchant Profile' },
        },
      },
    },
    '/dashboard/analytics': {
      get: {
        summary: 'Get Dashboard Analytics',
        parameters: [
          { name: 'days', in: 'query', required: false, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Analytics data' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
