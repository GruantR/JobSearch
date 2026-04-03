//src/app.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swaggerSpec'); 
const routes = require('./routes');
const app = express();
const globalErrorHandler = require('./middleware/errorHandlers/globalErrorHandler');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');

// Настройка CORS
// app.use(cors({
//     origin: [
//       'https://jobsearch-xsjk.onrender.com', // ваш домен
//       'http://localhost:3000',               // для локальной разработки
//       'http://localhost:3001'                // если фронтенд на другом порту
//     ],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
//   }));

  // Или для полного доступа (на время разработки):
app.use(cors());
  

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function requestLogger (req, res, next) {
    logger.info(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
}

// По умолчанию убираем шум логирования каждого запроса в терминале.
// Включать при необходимости: LOG_HTTP=true
if (process.env.LOG_HTTP === "true") {
  app.use(requestLogger);
}

// Dev-only UI for convenience. In production we don't serve anything from /front.
if (process.env.NODE_ENV !== 'production') {
  const frontDir = path.resolve(__dirname, '..', 'front');
  app.use(express.static(frontDir));
  // If there is no static asset for '/', serve the panel.
  app.get('/', (req, res) => {
    res.sendFile(path.join(frontDir, 'index.html'));
  });
}

app.use('/api', routes);

app.use(globalErrorHandler);



module.exports = app;
