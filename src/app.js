const express = require('express');
const routes = require('./routes');
const app = express();
const globalErrorHandler = require('./middleware/errorHandlers/globalErrorHandler')

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
