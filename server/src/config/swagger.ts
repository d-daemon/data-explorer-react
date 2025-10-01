import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

// Import app name from central config
const { APP_NAME } = require('../../../config');

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Data Dictionary Explorer API',
      version: '1.0.0',
      description: 'API documentation for the Data Dictionary Explorer application',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/{appName}/api',
        description: 'Development server',
        variables: {
          appName: {
            default: APP_NAME,
            description: 'Application name'
          }
        }
      },
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            error: {
              type: 'string',
              description: 'Error message if success is false'
            },
            details: {
              type: 'string',
              description: 'Additional error details if available'
            }
          }
        },
        FileInfo: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Name of the file'
            },
            size: {
              type: 'number',
              description: 'File size in bytes'
            },
            modified: {
              type: 'string',
              format: 'date-time',
              description: 'Last modified date'
            },
            sheets: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of sheet names in the Excel file'
            }
          }
        },
        SheetData: {
          type: 'object',
          properties: {
            headers: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Column headers'
            },
            rows: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              description: 'Data rows'
            },
            totalRows: {
              type: 'number',
              description: 'Total number of rows'
            }
          }
        },
        AnalyticsEvent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique event identifier'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Event timestamp'
            },
            event: {
              type: 'string',
              description: 'Event type'
            },
            component: {
              type: 'string',
              description: 'Component that triggered the event'
            },
            duration: {
              type: 'number',
              description: 'Duration of the event in milliseconds'
            },
            timeZone: {
              type: 'string',
              description: 'User timezone'
            }
          }
        },
        ChartData: {
          type: 'object',
          properties: {
            labels: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Chart labels'
            },
            data: {
              type: 'array',
              items: {
                type: 'number'
              },
              description: 'Chart data points'
            }
          }
        },
        PerformanceStats: {
          type: 'object',
          properties: {
            requests: {
              type: 'number',
              description: 'Total number of requests'
            },
            cacheHits: {
              type: 'number',
              description: 'Number of cache hits'
            },
            averageResponseTime: {
              type: 'number',
              description: 'Average response time in milliseconds'
            },
            totalResponseTime: {
              type: 'number',
              description: 'Total response time across all requests'
            }
          }
        },
        HealthStatus: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok'],
              description: 'Health check status'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Health check timestamp'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'string',
              description: 'Additional error details'
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // Path to the API files for JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(options);