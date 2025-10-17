//src/config/db.js

// const Sequelize = require('sequelize');
// require("dotenv").config();


// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST,
//     dialect: process.env.DIALECT || 'postgres',
//     logging: (msg) => {
//       // Выводим только SQL-запросы, игнорируем метаданные
//       if (msg.includes('SELECT') || msg.includes('INSERT') || msg.includes('UPDATE') || msg.includes('DELETE')) {
//         console.log(msg);
//       }
//     },
//    // logging: process.env.NODE_ENV === 'development' ? console.log : false,
//     pool: {
//         max: 5,        // Максимум соединений
//         min: 0,        // Минимум соединений  
//         acquire: 30000, // Время ожидания соединения
//         idle: 10000    // Время простаивания
//       }
//   }
// );

// module.exports = sequelize;


const Sequelize = require('sequelize');
require("dotenv").config();

// Для Neon.tech используем строку подключения напрямую
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Это важно для Neon.tech
    }
  },
  logging: (msg) => {
    // Выводим только SQL-запросы, игнорируем метаданные
    if (msg.includes('SELECT') || msg.includes('INSERT') || msg.includes('UPDATE') || msg.includes('DELETE')) {
      console.log(msg);
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;