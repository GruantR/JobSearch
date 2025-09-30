const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function logger (req, res, next) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
}

app.use(logger);
app.use('/api', routes);


module.exports = app;
