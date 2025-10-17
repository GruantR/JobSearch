//src/app.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swaggerSpec'); 
const routes = require('./routes');
const app = express();
const globalErrorHandler = require('./middleware/errorHandlers/globalErrorHandler');

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
