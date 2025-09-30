// src/middleware/errorHandlers/validationErrorHandler.js

/* это функция из express-validator, она умеет читать результаты всех валидаций, которые произошли до нее
 Express-validator накапливает ошибки в специальном месте объекта req
 validationResult(req) обращается к этому месту и получает все ошибки
 Каждый валидатор добавляет ошибки в req._validationErrors (специальное скрытое поле)
 validationResult(req) просто читает из req._validationErrors
Вся цепочка работает, потому что Express передает один и тот же объект req между всеми middleware
*/
const { validationResult } = require("express-validator");

/**
 * Middleware для обработки ошибок валидации
 * Проверяет результаты валидации и возвращает ошибки клиенту
 */
const handleValidationErrors = (req, res, next) => {
  // Получаем результаты валидации из express-validator
  const errors = validationResult(req);

  // Если есть ошибки валидации - возвращаем ответ с ошибками
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Ошибка валидации данных",
      errors: errors.array().map((error) => ({
        field: error.path, // Название поля с ошибкой (email, password и т.д.)
        message: error.msg, // Сообщение об ошибке
        value: error.value, // Значение которое ввел пользователь (опционально)
      })),
    });
  }

  // Если ошибок нет - переходим к следующему middleware/контроллеру
  next();
};

module.exports = handleValidationErrors;
