// src/routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/usersController');
const UserProfileController = require('../controllers/userProfilesController');
const authorizeToken = require('../middleware/authorizeToken');
const UserRoutesValidation = require('../middleware/validators/userRoutesValidation');
const handleValidationErrors = require('../middleware/errorHandlers/validationErrorHandler');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Управление пользователями
 */

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Получить список всех пользователей
 *     description: Возвращает список всех пользователей системы. Требует прав администратора.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Список пользователей"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
 *                   message: 'Требуется авторизация'
 *               ExpiredToken:
 *                 summary: Токен просрочен
 *                 value:
 *                   success: false
 *                   message: 'Токен просрочен'
 *               InvalidToken:
 *                 summary: Неверный токен
 *                 value:
 *                   success: false
 *                   message: 'Неверный токен'
 *               UserNotFound:
 *                 summary: Пользователь не найден
 *                 value:
 *                   success: false
 *                   message: 'Пользователь не найден'
 *       403:
 *         description: Доступ запрещен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorWithTextResponse'
 *             examples:
 *               NoPermission:
 *                 summary: Нет прав доступа
 *                 value:
 *                   success: false
 *                   message: 'Доступ запрещен'
 *                   error: 'Недостаточно прав для просмотра списка пользователей'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 *             examples:
 *               ServerError:
 *                 summary: Ошибка сервера
 *                 value:
 *                   success: false
 *                   message: 'Внутренняя ошибка сервера'
 */
router.get('/all', authorizeToken, UsersControllers.getUsers);
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     description: Возвращает  информацию о текущем пользователе вошедшем в систему. Требует авторизации
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Информация пользователя user@example.com"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
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
 *                   message: 'Требуется авторизация'
 *               ExpiredToken:
 *                 summary: Токен просрочен
 *                 value:
 *                   success: false
 *                   message: 'Токен просрочен'
 *               InvalidToken:
 *                 summary: Неверный токен
 *                 value:
 *                   success: false
 *                   message: 'Неверный токен'
 *               UserNotFound:
 *                 summary: Пользователь не найден
 *                 value:
 *                   success: false
 *                   message: 'Пользователь не найден'
 *       403:
 *         description: Доступ запрещен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorWithTextResponse'
 *             examples:
 *               NoPermission:
 *                 summary: Нет прав доступа
 *                 value:
 *                   success: false
 *                   message: 'Доступ запрещен'
 *                   error: 'Недостаточно прав для просмотра данных пользователя'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 *             examples:
 *               ServerError:
 *                 summary: Ошибка сервера
 *                 value:
 *                   success: false
 *                   message: 'Внутренняя ошибка сервера'
 */
router.get('/me',authorizeToken, UsersControllers.getCurrentUser);
/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Редактирование информации о текущем пользователе
 *     description: Обновляет email и/или пароль текущего пользователя. Требует авторизации.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *                 description: "Новый email пользователя"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "newSecurePassword123"
 *                 description: "Новый пароль пользователя"
 *           examples:
 *             updateEmail:
 *               summary: Обновление email
 *               value:
 *                 email: "newemail@example.com"
 *             updatePassword:
 *               summary: Обновление пароля
 *               value:
 *                 password: "newSecurePassword123"
 *             updateBoth:
 *               summary: Обновление email и пароля
 *               value:
 *                 email: "newemail@example.com"
 *                 password: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Данные пользователя успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Данные пользователя обновлены"
 *                 data:
 *                   type: object
 *                   properties:
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
 *                       message: 'Пароль может быть от 6 до 100 символов'
 *                       value: '123'
 *               NoDataToUpdate:
 *                 summary: Нет данных для обновления
 *                 value:
 *                   success: false
 *                   message: 'Нет данных для обновления'
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
 *                   message: 'Требуется авторизация'
 *               ExpiredToken:
 *                 summary: Токен просрочен
 *                 value:
 *                   success: false
 *                   message: 'Токен просрочен'
 *               InvalidToken:
 *                 summary: Неверный токен
 *                 value:
 *                   success: false
 *                   message: 'Неверный токен'
 *               UserNotFound:
 *                 summary: Пользователь не найден
 *                 value:
 *                   success: false
 *                   message: 'Пользователь не найден'
 *       403:
 *         description: Доступ запрещен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorWithTextResponse'
 *             examples:
 *               NoPermission:
 *                 summary: Нет прав доступа
 *                 value:
 *                   success: false
 *                   message: 'Доступ запрещен'
 *                   error: 'Недостаточно прав для внесения изменений данному пользователю'
*       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 *             examples:
 *               ServerError:
 *                 summary: Ошибка сервера
 *                 value:
 *                   success: false
 *                   message: 'Внутренняя ошибка сервера'
 */
router.patch('/me', authorizeToken, UserRoutesValidation.validateDataUpdateUser(), handleValidationErrors, UsersControllers.updateDataCurrentUser);
/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Удалить текущего пользователя
 *     description: Удаление пользователя вошедшего в систему. Требует авторизации.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Информация пользователя user@example.com"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: 'object'
 *                       properties:
 *                         id:
 *                           type: 'integer'
 *                           example: 1
 *                         email:
 *                           type: 'string'
 *                           example: 'user@example.com'
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
 *                   message: 'Требуется авторизация'
 *               ExpiredToken:
 *                 summary: Токен просрочен
 *                 value:
 *                   success: false
 *                   message: 'Токен просрочен'
 *               InvalidToken:
 *                 summary: Неверный токен
 *                 value:
 *                   success: false
 *                   message: 'Неверный токен'
 *               UserNotFound:
 *                 summary: Пользователь не найден
 *                 value:
 *                   success: false
 *                   message: 'Пользователь не найден'
 *       403:
 *         description: Доступ запрещен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorWithTextResponse'
 *             examples:
 *               NoPermission:
 *                 summary: Нет прав доступа
 *                 value:
 *                   success: false
 *                   message: 'Доступ запрещен'
 *                   error: 'Недостаточно прав для удаления данного пользователя'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 *             examples:
 *               ServerError:
 *                 summary: Ошибка сервера
 *                 value:
 *                   success: false
 *                   message: 'Внутренняя ошибка сервера'
 */
router.delete('/me', authorizeToken, UsersControllers.deleteCurrentUser);
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Получить информацию о профиле текущего пользователя
 *     description: Возвращает информацию о профиле текущего пользователя вошедшем в систему. Требует авторизации.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Профиль пользователя"
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/UserProfile'
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
 *                   message: 'Требуется авторизация'
 *               ExpiredToken:
 *                 summary: Токен просрочен
 *                 value:
 *                   success: false
 *                   message: 'Токен просрочен'
 *               InvalidToken:
 *                 summary: Неверный токен
 *                 value:
 *                   success: false
 *                   message: 'Неверный токен'
 *               UserNotFound:
 *                 summary: Пользователь не найден
 *                 value:
 *                   success: false
 *                   message: 'Пользователь не найден'
 *       403:
 *         description: Доступ запрещен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorWithTextResponse'
 *             examples:
 *               NoPermission:
 *                 summary: Нет прав доступа
 *                 value:
 *                   success: false
 *                   message: 'Доступ запрещен'
 *                   error: 'Недостаточно прав для просмотра данных пользователя'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 *             examples:
 *               ServerError:
 *                 summary: Ошибка сервера
 *                 value:
 *                   success: false
 *                   message: 'Внутренняя ошибка сервера'
 */
router.get('/profile',authorizeToken, UserProfileController.getDataProfileUser);
/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Редактирование профиля текущего пользователя
 *     description: Обновляет fullName и/или phoneNumber текущего пользователя. Требует авторизации.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Иванов Иван Иванович"
 *                 description: "ФИО пользователя (от 2 до 100 символов)"
 *               phoneNumber:
 *                 type: string
 *                 example: "+79991234567"
 *                 description: "Номер телефона (от 5 до 20 символов)"
 *           examples:
 *             updateFullName:
 *               summary: Обновление ФИО
 *               value:
 *                 fullName: "Иванов Иван Иванович"
 *             updatePhone:
 *               summary: Обновление телефона
 *               value:
 *                 phoneNumber: "+79991234567"
 *             updateBoth:
 *               summary: Обновление ФИО и телефона
 *               value:
 *                 fullName: "Иванов Иван Иванович"
 *                 phoneNumber: "+79991234567"
 *     responses:
 *       200:
 *         description: Данные профиля успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Данные профиля успешно обновлены"
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               profileValidationErrors:
 *                 summary: Ошибки валидации профиля
 *                 value:
 *                   success: false
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "fullName"
 *                       message: "ФИО должно быть от 2 до 100 символов"
 *                       value: "1"
 *                     - field: "fullName" 
 *                       message: "ФИО может содержать только буквы, пробелы и дефисы"
 *                       value: "1"
 *                     - field: "fullName"
 *                       message: "ФИО должно содержать имя и фамилию"
 *                       value: "1"
 *                     - field: "phoneNumber"
 *                       message: "Некорректный формат номера телефона"
 *                       value: "1"
 *                     - field: "phoneNumber"
 *                       message: "Номер должен быть от 5 до 20 символов"
 *                       value: "1"
 *               singleFieldError:
 *                 summary: Ошибка в одном поле
 *                 value:
 *                   success: false
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "fullName"
 *                       message: "ФИО должно содержать имя и фамилию"
 *                       value: "Иван"
 *               phoneValidationError:
 *                 summary: Ошибка валидации телефона
 *                 value:
 *                   success: false
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "phoneNumber"
 *                       message: "Некорректный формат номера телефона"
 *                       value: "abc123"
 *               NoDataToUpdate:
 *                 summary: Нет данных для обновления
 *                 value:
 *                   success: false
 *                   message: "Нет данных для обновления"
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
 *                   message: 'Требуется авторизация'
 *               ExpiredToken:
 *                 summary: Токен просрочен
 *                 value:
 *                   success: false
 *                   message: 'Токен просрочен'
 *               InvalidToken:
 *                 summary: Неверный токен
 *                 value:
 *                   success: false
 *                   message: 'Неверный токен'
 *               UserNotFound:
 *                 summary: Пользователь не найден
 *                 value:
 *                   success: false
 *                   message: 'Пользователь не найден'
 *       403:
 *         description: Доступ запрещен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorWithTextResponse'
 *             examples:
 *               NoPermission:
 *                 summary: Нет прав доступа
 *                 value:
 *                   success: false
 *                   message: 'Доступ запрещен'
 *                   error: 'Недостаточно прав для внесения изменений данному пользователю'
*       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 *             examples:
 *               ServerError:
 *                 summary: Ошибка сервера
 *                 value:
 *                   success: false
 *                   message: 'Внутренняя ошибка сервера'
 */
router.patch('/profile', authorizeToken, UserRoutesValidation.validateDataUpdateUserProfile(), handleValidationErrors, UserProfileController.patchDataProfileUser);


module.exports = router;