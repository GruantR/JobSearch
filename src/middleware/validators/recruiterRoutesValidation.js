// src/validation/recruiterRoutesValidation.js
const { body } = require("express-validator");

class RecruiterRoutesValidation {
  validateCreateRecruiter() {
    return [
      body("fullName")
        .optional()
        .notEmpty()
        .withMessage("ФИО не может быть пустым")
        .isLength({ min: 1, max: 255 })
        .withMessage("ФИО должно быть от 1 до 255 символов")
        .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-\.]+$/)
        .withMessage("ФИО может содержать только буквы, пробелы, точки и дефисы")
        .trim(),

      body("company")
        .optional()
        .notEmpty()
        .withMessage("Название компании не может быть пустым")
        .isLength({ min: 1, max: 255 })
        .withMessage("Название компании должно быть от 1 до 255 символов")
        .trim(),

      body("linkedinUrl")
        .optional()
        .isURL()
        .withMessage("LinkedIn URL должен быть валидной ссылкой")
        .isLength({ max: 500 })
        .withMessage("LinkedIn URL не должен превышать 500 символов")
        .trim(),

      body("contactInfo")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Контактная информация не должна превышать 500 символов")
        .trim(),

      body("position")
        .optional()
        .isLength({ max: 255 })
        .withMessage("Должность не должна превышать 255 символов")
        .trim(),

      body("notes")
        .optional()
        .isLength({ max: 10000 })
        .withMessage("Заметки не должны превышать 10000 символов")
        .trim(),

      body("lastContactDate")
        .optional()
        .isISO8601()
        .withMessage("Дата последнего контакта должна быть валидной датой"),

      // Статус игнорируем, так как при создании всегда 'contacting'
      body("status")
        .optional()
        .custom((value) => {
          if (value && value !== 'contacting') {
            throw new Error('При создании рекрутера статус игнорируется и устанавливается в "contacting"');
          }
          return true;
        })
    ];
  }

  validateUpdateRecruiter() {
    return [
      body("fullName")
        .optional()
        .notEmpty()
        .withMessage("ФИО не может быть пустым")
        .isLength({ min: 1, max: 255 })
        .withMessage("ФИО должно быть от 1 до 255 символов")
        .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-\.]+$/)
        .withMessage("ФИО может содержать только буквы, пробелы, точки и дефисы")
        .trim(),

      body("company")
        .optional()
        .notEmpty()
        .withMessage("Название компании не может быть пустым")
        .isLength({ min: 1, max: 255 })
        .withMessage("Название компании должно быть от 1 до 255 символов")
        .trim(),

      body("linkedinUrl")
        .optional()
        .isURL()
        .withMessage("LinkedIn URL должен быть валидной ссылкой")
        .isLength({ max: 500 })
        .withMessage("LinkedIn URL не должен превышать 500 символов")
        .trim(),

      body("contactInfo")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Контактная информация не должна превышать 500 символов")
        .trim(),

      body("position")
        .optional()
        .isLength({ max: 255 })
        .withMessage("Должность не должна превышать 255 символов")
        .trim(),

      body("notes")
        .optional()
        .isLength({ max: 10000 })
        .withMessage("Заметки не должны превышать 10000 символов")
        .trim(),

      body("lastContactDate")
        .optional()
        .isISO8601()
        .withMessage("Дата последнего контакта должна быть валидной датой"),

      // Запрещаем изменение статуса через этот метод
      body("status")
        .optional()
        .custom((value) => {
          throw new Error('Для изменения статуса используйте специальный метод PATCH /api/recruiters/:id/status');
        })
    ];
  }

  validateUpdateRecruiterStatus() {
    return [
      body("status")
        .notEmpty()
        .withMessage("Новый статус обязателен")
        .isIn(["contacting", "waiting", "in_process", "got_offer", "rejected", "archived"])
        .withMessage("Недопустимый статус рекрутера"),

      body("notes")
        .optional()
        .isLength({ max: 10000 })
        .withMessage("Заметки не должны превышать 10000 символов")
        .trim()
    ];
  }
}

module.exports = new RecruiterRoutesValidation();