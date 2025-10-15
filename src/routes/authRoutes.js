//src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const authRoutesValidation = require("../middleware/validators/authRoutesValidation");
const handleValidationErrors = require("../middleware/errorHandlers/validationErrorHandler");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Аутентификация и регистрация пользователей
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     description: Создает нового пользователя в системе
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: 'object'
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: 'string'
 *                 format: 'email'
 *                 example: 'user@example.com'
 *               password:
 *                 type: 'string'
 *                 format: 'password'
 *                 example: 'securePassword123'
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 success:
 *                   type: 'boolean'
 *                   example: true
 *                 message:
 *                   type: 'string'
 *                   example: 'Пользователь успешно зарегистрирован'
 *                 data:
 *                   type: 'object'
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               singleError:
 *                 summary: Одна ошибка
 *                 value:
 *                   success: false
 *                   message: 'Ошибка валидации данных'
 *                   errors:
 *                     - field: 'email'
 *                       message: 'Введите корректный email'
 *                       value: 'invalid-email'
 *               multipleErrors:
 *                 summary: Несколько ошибок
 *                 description: Сервер возвращает все ошибки сразу, а не только первую
 *                 value:
 *                   success: false
 *                   message: 'Ошибка валидации данных'
 *                   errors:
 *                     - field: 'email'
 *                       message: 'Введите корректный email'
 *                       value: 'invalid-email'
 *                     - field: 'password'
 *                       message: 'Пароль должен быть не менее 6 символов'
 *                       value: '123'
 *       409:
 *         description: Конфликт - пользователь уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               UserExists:
 *                 summary: Пользователь уже существует
 *                 value:
 *                   success: false
 *                   message: 'Пользователь с таким email уже существует'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               ServerError:
 *                 summary: Ошибка сервера
 *                 value:
 *                   success: false
 *                   message: 'Внутренняя ошибка сервера'
 */
router.post(
  "/register",
  authRoutesValidation.validateDataRegisterUser(),
  handleValidationErrors,
  AuthController.createUser
);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Логирование пользователя
 *     description: Авторизирует пользователя в системе
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: 'object'
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: 'string'
 *                 format: 'email'
 *                 example: 'user@example.com'
 *               password:
 *                 type: 'string'
 *                 format: 'password'
 *                 example: 'securePassword123'
 *     responses:
 *       200:
 *         description: Успешный вход в систему
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 success:
 *                   type: 'boolean'
 *                   example: true
 *                 message:
 *                   type: 'string'
 *                   example: 'Успешный вход в систему'
 *                 data:
 *                   type: 'object'
 *                   properties:
 *                     token:
 *                       type: 'string'
 *                       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *                     user:
 *                       type: 'object'
 *                       properties:
 *                         id:
 *                           type: 'integer'
 *                           example: 1
 *                         email:
 *                           type: 'string'
 *                           example: 'user@example.com'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               singleError:
 *                 summary: Одна ошибка
 *                 value:
 *                   success: false
 *                   message: 'Ошибка валидации данных'
 *                   errors:
 *                     - field: 'email'
 *                       message: 'Введите корректный email'
 *                       value: 'invalid-email'
 *               multipleErrors:
 *                 summary: Несколько ошибок
 *                 description: Сервер возвращает все ошибки сразу, а не только первую
 *                 value:
 *                   success: false
 *                   message: 'Ошибка валидации данных'
 *                   errors:
 *                     - field: 'email'
 *                       message: 'Введите корректный email'
 *                       value: 'invalid-email'
 *                     - field: 'password'
 *                       message: 'Пароль должен быть не менее 6 символов'
 *                       value: '123'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               MissingAuth:
 *                 summary: Отсутствует заголовок авторизации
 *                 value:
 *                   success: false
 *                   message: 'Неверный email или пароль'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               ServerError:
 *                 summary: Ошибка сервера
 *                 value:
 *                   success: false
 *                   message: 'Внутренняя ошибка сервера'
 */
router.post(
  "/login",
  authRoutesValidation.validateDataLoginUser(),
  handleValidationErrors,
  AuthController.loginUser
);

module.exports = router;
