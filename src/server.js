require('dotenv').config();

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST;

app.get('/',(req,res) => {
    res.send(`Сервер запущен на порту ${PORT}`)
});

app.listen(PORT, ()=>{
    console.log(`Сервер запущен на htpp://${DB_HOST}:${PORT}`)
})