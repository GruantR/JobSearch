//src/config/db.js
const Sequelize = require('sequelize');
const logger = require("../utils/logger");
// Без NODE_ENV (например `npm start`) подхватываем .env.development, как в `npm run dev`
require("dotenv-flow").config({ default_node_env: "development" });

logger.info('🔧 [DB Config] DATABASE_URL:', process.env.DATABASE_URL ? 'present' : 'missing');
logger.info('🔧 [DB Config] NODE_ENV:', process.env.NODE_ENV);

let sequelize;

if (process.env.DATABASE_URL) {
  // Production - используем строку подключения от Neon
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: getLogging(),
    pool: getPoolConfig()
  });
  logger.info("🔗 [DB Config] Подключение к Neon.tech (Production)");
} else {
  // Development - используем отдельные переменные
  sequelize = new Sequelize(
    process.env.DB_NAME || 'job_search',
    process.env.DB_USER || 'postgres', 
    process.env.DB_PASS || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: getLogging(),
      pool: getPoolConfig()
    }
  );
  logger.info("🔗 [DB Config] Подключение к локальной PostgreSQL (Development)");
}


// Функции для вынесения общей логики
function getLogging() {
  // SQL-логи довольно шумные; включаем только при необходимости.
  // Включить: LOG_SQL=true
  if (process.env.LOG_SQL !== "true") {
    return () => {};
  }

  return (msg) => {
    if (
      msg.includes("SELECT") ||
      msg.includes("INSERT") ||
      msg.includes("UPDATE") ||
      msg.includes("DELETE")
    ) {
      logger.debug(msg);
    }
  };
}

function getPoolConfig() {
  return {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  };
}

module.exports = sequelize;