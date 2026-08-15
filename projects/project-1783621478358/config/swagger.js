'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jarvis App API',
      version: '1.0.0',
      description: 'Otomatik oluşturulan API dokümantasyonu'
    }
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);
