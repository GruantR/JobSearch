//src/errors/customErrors.js
/**
 * Базовый класс для всех кастомных ошибок приложения
 */

// Создаем класс AppError, который наследуется от встроенного класса Error
// Это позволяет создавать специализированные типы ошибок с дополнительной информацией
class AppError extends Error {
  // Конструктор класса принимает:
  // - message: описание ошибки (обязательный)
  // - statusCode: HTTP-статус код (по умолчанию 500 - Internal Server Error)
  constructor(message, statusCode = 500) {
    // Вызываем конструктор родительского класса (Error) с переданным сообщением
    // Это устанавливает стандартное свойство message для ошибки
    super(message);

    // Устанавливаем имя ошибки равным имени класса (AppError)
    // Это полезно для отладки, чтобы отличать наши кастомные ошибки от стандартных
    this.name = this.constructor.name;

    // Сохраняем HTTP-статус код для последующего использования в middleware обработки ошибок
    // Позволяет отправлять правильный статус ответа клиенту
    this.statusCode = statusCode;

    // Флаг isOperational указывает, что это "операционная" ошибка
    // (ожидаемая в процессе работы приложения, а не баг в коде)
    // Примеры: неверные данные от пользователя, отсутствие ресурса
    // Такие ошибки не требуют экстренного исправления кода
    this.isOperational = true;

    // Создаем и сохраняем стектрейс (цепочку вызовов, приведшую к ошибке)
    // Второй параметр (this.constructor) исключает из стека вызов самого конструктора AppError
    // Это делает стектрейс более чистым и показывающим место реального возникновения ошибки
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ошибка аутентификации (неверный логин/пароль, нет токена)
 */

// Создаем класс Authentication, который наследуется от AppError
// Это позволяет создавать конкретный тип ошибок для проблем с аутентификацией
class AuthenticationError extends AppError {
  // Конструктор принимает опциональный параметр message
  // Если сообщение не передано, используется значение по умолчанию
  constructor(message = "Ошибка аутентификации") {
    // Вызываем конструктор родительского класса (AppError)
    // Передаем:
    // - message (либо переданный, либо значение по умолчанию)
    // - статус код 401 (Unauthorized) - фиксированное значение для этого типа ошибок
    super(message, 401);
    // После вызова super() неявно выполняются унаследованные операции:
    // this.name = 'Authentication' (имя класса)
    // this.isOperational = true (операционная ошибка)
    // Error.captureStackTrace(this, this.constructor) (сохранение стека)
  }
}

/**
 * Ошибка доступа (нет прав для действия)
 */
class ForbiddenError extends AppError {
  constructor(message = "Доступ запрещен") {
    super(message, 403);
  }
}

/**
 * Ошибка "Не найдено" (пользователь, вакансия и т.д.)
 */
class NotFoundError extends AppError {
  constructor(message = "Ресурс не найден") {
    super(message, 404);
  }
}

/**
 * Ошибка валидации данных (от Sequelize или бизнес-логики)
 */
class ValidationError extends AppError {
  constructor(message = "Ошибка валидации данных") {
    super(message, 400);
  }
}

/**
 * Ошибка конфликта (уникальное поле уже существует)
 */
class ConflictError extends AppError {
  constructor(message = "Ресурс уже существует") {
    super(message, 409);
  }
}
class BadRequestError extends AppError {
  constructor(message = "Некорректные данные") {
    super(message, 400);
  }
}

/**
 * Ошибка валидации статусов
 */
class StatusValidationError extends AppError {
  constructor(message = "Недопустимое изменение статуса") {
    super(message, 400);
  }
}

class StructuredValidationError extends ValidationError {
  constructor(message = "Ошибка валидации данных", errors = []) {
    super(message);
    this.structuredErrors = errors; // Сохраняем структурированные ошибки
  }
}

module.exports = {
  AppError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  BadRequestError,
  StatusValidationError,
};
