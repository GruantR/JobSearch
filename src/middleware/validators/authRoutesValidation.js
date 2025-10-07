//src/middleware/validators/usersRoutesValidation.js

const { body } = require("express-validator");
/**
 * Класс для валидации аутентификации
 */
class AuthRoutesValidation {
  /**
   * Валидация данных при регистрации
   * @returns {Array} Массив middleware валидации
   */
  validateDataRegisterUser () {
    return [
          // Валидация email
         body('email')
        .isEmail()
        .withMessage('Введите корректный email')
        .normalizeEmail() // Приводим к нормальному виду (lowercase и т.д.)
        .isLength({ max: 255 })
        .withMessage('Email не должен превышать 255 символов'),
        // Валидация пароля
      body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен быть минимум 6 символов')
        .isLength({ max: 100 })
        .withMessage('Пароль не должен превышать 100 символов')
        .trim(), // Убираем пробелы по краям

    ]

  };
  validateDataLoginUser () {
     return [
      body('email')
        .isEmail()
        .withMessage('Введите корректный email')
        .normalizeEmail(),

      body('password')
        .notEmpty()
        .withMessage('Введите пароль')
        .trim()
    ];
  }



};

module.exports = new AuthRoutesValidation();