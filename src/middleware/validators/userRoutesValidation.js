const { body } = require("express-validator");

class UserRoutesValidation {
  validateDataUpdateUser() {
    return [
      body("email")
        .optional()
        .isEmail()
        .withMessage("Некорректный формат email")
        .normalizeEmail(),

      body("password")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Пароль может быть от 6 до 100 символов")
,
    ];
  }
  validateDataUpdateUserProfile() {
    return [
      body("fullName")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("ФИО должно быть от 2 до 100 символов")
        .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/)
        .withMessage("ФИО может содержать только буквы, пробелы и дефисы")
        .trim()
        .custom((value) => {
          if (value & (value.trim().split(" ").length < 2)) {
            throw new Error("ФИО должно содержать имя и фамилию");
          }
          return true;
        }),

      body("phomeNumber")
        .optional()
        .matches(
          /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/
        )
        .withMessage("Некорректный формат номера телефона")
        .isLength({ min: 5, max: 20 })
        .withMessage("Номер должен быть от 5 до 20 символов")
        .trim(),
    ];
  }
}

module.exports = new UserRoutesValidation();
