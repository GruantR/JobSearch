//src/server.js
require("dotenv-flow").config();
const app = require("./app"); // Приложение Express
const { initializeDatabase } = require("./models"); // Функция инициализации

const PORT = process.env.PORT || 3000;

// Асинхронная функция запуска
const startServer = async () => {
  try {
    console.log("🔧 ===== ИНФОРМАЦИЯ О СРЕДЕ =====");
    console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(
      `🔗 DATABASE_URL: ${process.env.DATABASE_URL ? "УСТАНОВЛЕН" : "НЕТ"}`
    );
    console.log(`🏠 DB_HOST: ${process.env.DB_HOST || "НЕТ"}`);
    console.log(
      `📊 Используется БД: ${
        process.env.DATABASE_URL
          ? "Neon.tech (Production)"
          : "Локальная PostgreSQL (Development)"
      }`
    );
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`📚 Документация: http://localhost:${PORT}/api-docs`);
    if (process.env.NODE_ENV === "production") {
      console.log(`🌐 Продакшен URL: https://jobsearch-xsjk.onrender.com`);
    }
    console.log("🔧 ===============================");

    // 1. Сначала инициализируем БД
    console.log("🔄 Инициализация базы данных...");
    const dbInitialized = await initializeDatabase();

    if (!dbInitialized) {
      throw new Error("Не удалось инициализировать базу данных");
    }

    // После инициализации БД добавляем:
    console.log("🔄 Инициализация Telegram бота...");
    require("../src/bot/comand"); // Это запустит нашего бота

    // 2. Затем запускаем сервер
    app.listen(PORT, () => {
      console.log(`✅ Сервер запущен на порту ${PORT}`);
      console.log(`📚 Документация: http://localhost:${PORT}/api-docs`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Ошибка запуска сервера:", error);
    process.exit(1); // Завершаем процесс с ошибкой
  }
};

// Запускаем сервер
startServer();
