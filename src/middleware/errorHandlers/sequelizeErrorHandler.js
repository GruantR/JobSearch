//src middleware/errorHandlers/sequelizeErrorHandler.js

// Импортируем встроенные ошибки из Sequelize ORM
const {
  ValidationError, // Ошибки валидации данных модели
  UniqueConstraintError, // Нарушение уникальных ограничений
  ForeignKeyConstraintError, // Нарушение внешних ключей
  DatabaseError, // Общие ошибки базы данных
} = require("sequelize");

// Импортируем наши кастомные ошибки
// Переименовываем ValidationError из customErrors чтобы избежать конфликта имен
const {
  ValidationError: AppValidationError,
  ConflictError,
} = require("../../errors/customErrors");

/**
 * Преобразует ошибки Sequelize в наши кастомные ошибки
 * @param {Error} error - Ошибка, перехваченная из Sequelize
 * @returns {Error} - Преобразованная кастомная ошибка или оригинальная ошибка
 */
const handleSequelizeErrors = (error) => {
  // Ошибка валидации Sequelize (непрохождение validate в модели)
  if (error instanceof ValidationError) {
    // Преобразуем массив ошибок Sequelize в читаемое сообщение
    // error.errors - это массив объектов с деталями каждой ошибки валидации
    const messages = error.errors.map((err) => `${err.path}: ${err.message}`);
    // Создаем нашу кастомную ошибку валидации
    return new AppValidationError(messages.join(", "));
  }

  /*
ПРИМЕР ДЛЯ ЧЕГО ВСЕ ЭТО
// Sequelize выбросит ValidationError если email невалидный
// Оригинальная ошибка:
ValidationError {
  errors: [
    {
      path: 'email',
      message: 'Validation isEmail on email failed',
      // ... другие свойства
    }
  ]
}

// После преобразования:
AppValidationError {
  message: 'email: Validation isEmail on email failed',
  statusCode: 400,
  isOperational: true
}

*/

  // Ошибка уникальности (duplicate key) - попытка создать дублирующую запись
  if (error instanceof UniqueConstraintError) {
    // Извлекаем название поля из первой ошибки (обычно это поле с конфликтом)
    // error.errors[0]?.path - безопасное извлечение пути (названия поля)
    const field = error.errors[0]?.path || "поле";
    // Создаем ошибку конфликта с информативным сообщением
    return new ConflictError(`Пользователь с таким ${field} уже существует`);
  }

  // Ошибка внешнего ключа - ссылка на несуществующую запись
  if (error instanceof ForeignKeyConstraintError) {
    // Создаем ошибку валидации с понятным сообщением
    return new AppValidationError("Некорректная ссылка на связанный ресурс");
  }

  // Общая ошибка базы данных (синтаксис SQL, проблемы подключения и т.д.)
  if (error instanceof DatabaseError) {
    // Логируем технические детали для разработчика
    console.error("Database Error:", error);
    // Но пользователю показываем общее сообщение (безопасность!)
    return new AppValidationError("Ошибка базы данных");
  }

  // Если это не ошибка Sequelize - возвращаем как есть
  // Это могут быть наши кастомные ошибки или другие системные ошибки
  return error;
};

module.exports = handleSequelizeErrors;
