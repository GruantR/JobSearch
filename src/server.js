require('dotenv').config();
const app = require('./app'); // Приложение Express
const { initializeDatabase } = require('./models'); // Функция инициализации

const PORT = process.env.PORT || 3000;

// Асинхронная функция запуска
const startServer = async () => {
  try {
    // 1. Сначала инициализируем БД
    console.log('🔄 Инициализация базы данных...');
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      throw new Error('Не удалось инициализировать базу данных');
    }
    
    // 2. Затем запускаем сервер
    app.listen(PORT, () => {
      console.log(`✅ Сервер запущен на порту ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1); // Завершаем процесс с ошибкой
  }
};

// Запускаем сервер
startServer();