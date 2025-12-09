// src/validation/vacancyRoutesValidation.js.js
const { body } = require("express-validator");

class VacancyRoutesValidation {
  validateCreateVacancy() {
    return [
      body("companyName")
        .notEmpty()
        .withMessage("Название компании обязательно")
        .isLength({ min: 1, max: 255 })
        .withMessage("Название компании должно быть от 1 до 255 символов")
        .trim(),

      body("jobTitle")
        .notEmpty()
        .withMessage("Должность обязательна")
        .isLength({ min: 1, max: 255 })
        .withMessage("Должность должна быть от 1 до 255 символов")
        .trim(),

      body("description")
        .optional()
        .isLength({ max: 5000 })
        .withMessage("Описание не должно превышать 5000 символов")
        .trim(),

      body("sourcePlatform")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Платформа не должна превышать 100 символов")
        .trim(),

      body("source_url")
        .optional()
        .isURL()
        .withMessage("URL источника должен быть валидной ссылкой")
        .isLength({ max: 500 })
        .withMessage("URL не должен превышать 500 символов")
        .trim(),

      body("salary")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Зарплата не должна превышать 100 символов")
        .trim(),

      body("applicationDate")
        .optional()
        .isISO8601()
        .withMessage("Дата отклика должна быть валидной датой"),

      body("notes")
        .optional()
        .isLength({ max: 10000 })
        .withMessage("Заметки не должны превышать 10000 символов")
        .trim()
      //   ,


      // // Статус игнорируем, так как при создании всегда 'found'
      // body("status")
      //   .optional()
      //   .custom((value) => {
      //     if (value && value !== 'found') {
      //       throw new Error('При создании вакансии статус игнорируется и устанавливается в "found"');
      //     }
      //     return true;
      //   })
    ];
  }

  validateUpdateVacancy() {
    return [
      body("companyName")
        .optional()
        .notEmpty()
        .withMessage("Название компании не может быть пустым")
        .isLength({ min: 1, max: 255 })
        .withMessage("Название компании должно быть от 1 до 255 символов")
        .trim(),

      body("jobTitle")
        .optional()
        .notEmpty()
        .withMessage("Должность не может быть пустой")
        .isLength({ min: 1, max: 255 })
        .withMessage("Должность должна быть от 1 до 255 символов")
        .trim(),

      body("description")
        .optional()
        .isLength({ max: 5000 })
        .withMessage("Описание не должно превышать 5000 символов")
        .trim(),

      body("sourcePlatform")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Платформа не должна превышать 100 символов")
        .trim(),

      body("source_url")
        .optional()
        .isURL()
        .withMessage("URL источника должен быть валидной ссылкой")
        .isLength({ max: 500 })
        .withMessage("URL не должен превышать 500 символов")
        .trim(),

      body("salary")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Зарплата не должна превышать 100 символов")
        .trim(),

      body("applicationDate")
        .optional()
        .isISO8601()
        .withMessage("Дата отклика должна быть валидной датой"),

      body("notes")
        .optional()
        .isLength({ max: 10000 })
        .withMessage("Заметки не должны превышать 10000 символов")
        .trim(),

      // Запрещаем изменение статуса через этот метод
      body("status")
        .optional()
        .custom((value) => {
          throw new Error('Для изменения статуса используйте специальный метод PATCH /api/vacancies/:id/status');
        })
    ];
  }

  validateUpdateVacancyStatus() {
    return [
      body("status")
        .notEmpty()
        .withMessage("Новый статус обязателен")
        .isIn(["found", "applied", "viewed", "noResponse", "invited", "offer", "rejected", "archived"])
        .withMessage("Недопустимый статус вакансии"),

      body("notes")
        .optional()
        .isLength({ max: 10000 })
        .withMessage("Заметки не должны превышать 10000 символов")
        .trim()
    ];
  }
}

module.exports = new VacancyRoutesValidation();