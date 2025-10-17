//src/app.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swaggerSpec'); 
const routes = require('./routes');
const app = express();
const globalErrorHandler = require('./middleware/errorHandlers/globalErrorHandler');
const cors = require('cors');

// Настройка CORS
app.use(cors({
    origin: [
      'https://jobsearch-xsjk.onrender.com', // ваш домен на Render
      'http://localhost:3000' // для локальной разработки
    ],
    credentials: true, // если используете куки или аутентификацию
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function logger (req, res, next) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
}

app.use(logger);
app.use('/api', routes);

app.use(globalErrorHandler);


module.exports = app;
