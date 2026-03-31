//src/server.js
require("dotenv-flow").config({ default_node_env: "development" });
const logger = require("./utils/logger");
const app = require("./app"); // Приложение Express
const { initializeDatabase } = require("./models"); // Функция инициализации

const PORT = process.env.PORT || 3000;

// Валидация критических переменных окружения
const validateEnvironment = () => {
  const requiredVars = [];
  
  // SECRET_KEY обязателен для JWT
  if (!process.env.SECRET_KEY) {
    requiredVars.push('SECRET_KEY');
  }
  
  // TELEGRAM_BOT_TOKEN обязателен если бот включен
  if (process.env.ENABLE_BOT !== 'false' && !process.env.TELEGRAM_BOT_TOKEN) {
    requiredVars.push('TELEGRAM_BOT_TOKEN');
  }
  
  if (requiredVars.length > 0) {
    throw new Error(
      `❌ Отсутствуют обязательные переменные окружения: ${requiredVars.join(', ')}\n` +
      `Пожалуйста, установите их в файле .env или переменных окружения.`
    );
  }
};

// Асинхронная функция запуска
const startServer = async () => {
  try {
    // Валидация переменных окружения
    validateEnvironment();
    logger.info("🔧 ===== ИНФОРМАЦИЯ О СРЕДЕ =====");
    logger.info(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
    logger.info(
      `🔗 DATABASE_URL: ${process.env.DATABASE_URL ? "УСТАНОВЛЕН" : "НЕТ"}`
    );
    logger.info(`🏠 DB_HOST: ${process.env.DB_HOST || "НЕТ"}`);
    logger.info(
      `📊 Используется БД: ${
        process.env.DATABASE_URL
          ? "Neon.tech (Production)"
          : "Локальная PostgreSQL (Development)"
      }`
    );
    logger.info(`🚀 Сервер запущен: http://localhost:${PORT}`);
    logger.info(`📚 Документация: http://localhost:${PORT}/api-docs`);
    if (process.env.NODE_ENV === "production") {
      const publicUrl =
        process.env.PUBLIC_URL ||
        process.env.RENDER_EXTERNAL_URL ||
        "(задайте PUBLIC_URL или RENDER_EXTERNAL_URL на Render)";
      logger.info(`🌐 Публичный URL сервиса: ${publicUrl}`);
    }
    logger.info("🔧 ===============================");

    // 1. Сначала инициализируем БД
    logger.info("🔄 Инициализация базы данных...");
    const dbInitialized = await initializeDatabase();

    if (!dbInitialized) {
      throw new Error("Не удалось инициализировать базу данных");
    }

    // После инициализации БД добавляем:
    logger.info("🔄 Инициализация Telegram бота...");
    require("./bot/comand"); // Это запустит нашего бота

    const telegramBot = require("./bot/bot");
    const { attachTelegramWebhook } = require("./bot/attachWebhook");
    attachTelegramWebhook(app, telegramBot);

    // 2. Затем запускаем сервер
    app.listen(PORT, () => {
      logger.info(`✅ Сервер запущен на порту ${PORT}`);
      logger.info(`📚 Документация: http://localhost:${PORT}/api-docs`);
      logger.info(`🌐 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error("❌ Ошибка запуска сервера:", error);
    process.exit(1); // Завершаем процесс с ошибкой
  }
};

// Запускаем сервер
startServer();
