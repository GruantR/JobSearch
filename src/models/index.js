//src/models/index.js
const sequelize = require('../config/db');

// Импортируем модели
const User = require('./User');
const UserProfile = require('./UserProfile');


// Определяем отношения
User.hasOne(UserProfile,{
      foreignKey: 'userId',
    onDelete: 'CASCADE'
});
UserProfile.belongsTo(User, {
  foreignKey: 'userId'
});

// Экспортируем модели и функцию инициализации
const models = {
  sequelize,
  User,
  UserProfile
};

// Функция инициализации БД (НЕ вызывается сразу!)
const initializeDatabase = async () => {
  try {
    // 1. Проверяем подключение
    await sequelize.authenticate();
    console.log('✅ База данных подключена');
    
    // 2. Синхронизируем с контролем режима
    const syncOptions = {
    };
    
    if (process.env.NODE_ENV === 'development') {
      // В development: alter: true - безопасно изменяет структуру
      syncOptions.alter = true;
    } else if (process.env.NODE_ENV === 'test') {
      // В test: force: true - пересоздает БД для чистых тестов
      syncOptions.force = true;
    }
    // В production: не используем force/alter - только миграции
    
    await sequelize.sync(syncOptions);
    console.log('✅ Модели синхронизированы');
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка БД:', error);
    return false;
  }
};

module.exports = { models, initializeDatabase }; // Контролируемый экспорт