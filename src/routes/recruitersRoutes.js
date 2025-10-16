//src/routes/recruitersRoutes.js
const express = require('express');
const router = express.Router();
const RecruiterController = require('../controllers/recruitersController');
const StatusHistoryController = require('../controllers/statusHistoryController');
const authorizeToken = require('../middleware/authorizeToken');
const RecruiterRoutesValidation = require('../middleware/validators/recruiterRoutesValidation');
const handleValidationErrors = require('../middleware/errorHandlers/validationErrorHandler');

/**
 * @swagger
 * tags:
 *   name: Recruiters
 *   description: Управление рекрутерами
 */

/**
 * @swagger
 * /recruiters:
 *   post:
 *     summary: Создать нового рекрутера
 *     description: Создает нового рекрутера для текущего пользователя
 *     tags: [Recruiters]
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
 *                 description: "ФИО рекрутера (1-255 символов)"
 *               company:
 *                 type: string
 *                 example: "Tech Company Inc."
 *                 description: "Название компании (1-255 символов)"
 *               linkedinUrl:
 *                 type: string
 *                 example: "https://linkedin.com/in/ivanov"
 *                 description: "Ссылка на LinkedIn (до 500 символов)"
 *               contactInfo:
 *                 type: string
 *                 example: "ivanov@company.com, +79991234567"
 *                 description: "Контактная информация (до 500 символов)"
 *               position:
 *                 type: string
 *                 example: "HR Manager"
 *                 description: "Должность (до 255 символов)"
 *               notes:
 *                 type: string
 *                 example: "Очень отзывчивый рекрутер"
 *                 description: "Заметки (до 10000 символов)"
 *               lastContactDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T10:30:00.000Z"
 *                 description: "Дата последнего контакта"
 *           examples:
 *             minimalData:
 *               summary: Минимальные данные
 *               value:
 *                 fullName: "Иванов Иван"
 *                 company: "Tech Company"
 *             fullData:
 *               summary: Все поля
 *               value:
 *                 fullName: "Иванов Иван Иванович"
 *                 company: "Tech Company Inc."
 *                 linkedinUrl: "https://linkedin.com/in/ivanov"
 *                 contactInfo: "ivanov@company.com"
 *                 position: "HR Manager"
 *                 notes: "Очень отзывчивый рекрутер"
 *                 lastContactDate: "2024-01-15T10:30:00.000Z"
 *     responses:
 *       201:
 *         description: Рекрутер успешно создан
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
 *                   example: "Рекрутер успешно создан"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recruiter:
 *                       $ref: '#/components/schemas/Recruiter'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               multipleErrors:
 *                 summary: Множественные ошибки валидации
 *                 value:
 *                   success: false
 *                   message: ""
 *                   errors:
 *                     - field: "fullName"
 *                       message: "ФИО не может быть пустым"
 *                       value: ""
 *                     - field: "fullName" 
 *                       message: "ФИО должно быть от 1 до 255 символов"
 *                       value: "1"
 *                     - field: "fullName"
 *                       message: "ФИО может содержать только буквы, пробелы и дефисы"
 *                       value: ""
 *                     - field: "company"
 *                       message: "Название компании не может быть пустым"
 *                       value: ""
 *                     - field: "company"
 *                       message: "Название компании должно быть от 1 до 255 символов"
 *                       value: ""
 *                     - field: "linkedinUrl"
 *                       message: "LinkedIn URL должен быть валидной ссылкой"
 *                       value: ""
 *                     - field: "lastContactDate"
 *                       message: "Дата последнего контакта должна быть валидной датой"
 *                       value: ""
 *               singleError:
 *                 summary: Неверная ссылка LinkedIn
 *                 value:
 *                   success: false
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "linkedinUrl"
 *                       message: "LinkedIn URL должен быть валидной ссылкой"
 *                       value: "invalid-url"
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
 */
router.post('/', authorizeToken, RecruiterRoutesValidation.validateCreateRecruiter(), handleValidationErrors, RecruiterController.createRecruiter);

/**
 * @swagger
 * /recruiters:
 *   get:
 *     summary: Получить список рекрутеров
 *     description: Возвращает список всех рекрутеров текущего пользователя
 *     tags: [Recruiters]
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
 *                   example: "Список рекрутеров"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recruiters:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Recruiter'
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
 *                   error: 'Недостаточно прав для просмотра данных'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 */
router.get('/', authorizeToken, RecruiterController.getRecruiters);

/**
 * @swagger
 * /recruiters/{id}:
 *   get:
 *     summary: Получить рекрутера по ID
 *     description: Возвращает информацию о конкретном рекрутере
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID рекрутера
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
 *                   example: "Данные рекрутера"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recruiter:
 *                       $ref: '#/components/schemas/Recruiter'
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
 *                   error: 'Недостаточно прав для просмотра данных'
 *       404:
 *         description: Рекрутер не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               NotFound:
 *                 summary: Рекрутер не найден
 *                 value:
 *                   success: false
 *                   message: "Рекрутер не найден"
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 */
router.get('/:id', authorizeToken, RecruiterController.getRecruiter);

/**
 * @swagger
 * /recruiters/{id}:
 *   delete:
 *     summary: Удалить рекрутера
 *     description: Удаляет рекрутера по ID
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID рекрутера
 *     responses:
 *       200:
 *         description: Рекрутер успешно удален
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
 *                   example: "Выбранный рекрутёр успешно удалён"
 *                 data:
 *                    type: object
 *                    properties:
 *                      recruiter:
 *                        type: object
 *                        properties:
 *                          id:
 *                            type: 'integer'
 *                            example: 1
 *                          fullName:
 *                            type: 'string'
 *                            example: FullName
 * 
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
 *       404:
 *         description: Рекрутер не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 */
router.delete('/:id', authorizeToken, RecruiterController.deleteRecruiter);

/**
 * @swagger
 * /recruiters/{id}:
 *   patch:
 *     summary: Обновить данные рекрутера
 *     description: Обновляет информацию о рекрутере (кроме статуса)
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID рекрутера
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
 *               company:
 *                 type: string
 *                 example: "New Company Inc."
 *               linkedinUrl:
 *                 type: string
 *                 example: "https://linkedin.com/in/ivanov-new"
 *               contactInfo:
 *                 type: string
 *                 example: "new-email@company.com"
 *               position:
 *                 type: string
 *                 example: "Senior HR Manager"
 *               notes:
 *                 type: string
 *                 example: "Обновленные заметки"
 *               lastContactDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-20T15:45:00.000Z"
 *           examples:
 *             updateName:
 *               summary: Обновление ФИО
 *               value:
 *                 fullName: "Иванов Иван Иванович"
 *             updateMultiple:
 *               summary: Обновление нескольких полей
 *               value:
 *                 fullName: "Иванов Иван Иванович"
 *                 company: "New Company Inc."
 *                 position: "Senior HR Manager"
 *     responses:
 *       200:
 *         description: Данные рекрутера успешно обновлены
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
 *                   example: "Данные выбранного рекрутёра изменены"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recruiter:
 *                       $ref: '#/components/schemas/Recruiter'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               statusUpdateError:
 *                 summary: Попытка изменить статус
 *                 value:
 *                   success: false
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "status"
 *                       message: "Для изменения статуса используйте специальный метод PATCH /api/recruiters/:id/status"
 *                       value: "waiting"
 *               multipleErrors:
 *                 summary: Множественные ошибки валидации
 *                 value:
 *                   success: false
 *                   message: ""
 *                   errors:
 *                     - field: "fullName"
 *                       message: "ФИО не может быть пустым"
 *                       value: ""
 *                     - field: "fullName" 
 *                       message: "ФИО должно быть от 1 до 255 символов"
 *                       value: "1"
 *                     - field: "fullName"
 *                       message: "ФИО может содержать только буквы, пробелы и дефисы"
 *                       value: ""
 *                     - field: "company"
 *                       message: "Название компании не может быть пустым"
 *                       value: ""
 *                     - field: "company"
 *                       message: "Название компании должно быть от 1 до 255 символов"
 *                       value: ""
 *                     - field: "linkedinUrl"
 *                       message: "LinkedIn URL должен быть валидной ссылкой"
 *                       value: ""
 *                     - field: "lastContactDate"
 *                       message: "Дата последнего контакта должна быть валидной датой"
 *                       value: ""
 *               singleError:
 *                 summary: Одиночная ошибка валидации
 *                 value:
 *                   success: false
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "linkedinUrl"
 *                       message: "LinkedIn URL должен быть валидной ссылкой"
 *                       value: "invalid-url"
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
 *       404:
 *         description: Рекрутер не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 */
router.patch('/:id', authorizeToken, RecruiterRoutesValidation.validateUpdateRecruiter(), handleValidationErrors, RecruiterController.patchRecruiterData);

/**
 * @swagger
 * /recruiters/{id}/status:
 *   patch:
 *     summary: Обновить статус рекрутера
 *     description: Изменяет статус рекрутера
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID рекрутера
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [contacting, waiting, in_process, got_offer, rejected, archived]
 *                 example: "waiting"
 *                 description: "Новый статус рекрутера"
 *               notes:
 *                 type: string
 *                 example: "Рекрутер запросил дополнительное время"
 *                 description: "Заметки к изменению статуса"
 *           examples:
 *             changeStatus:
 *               summary: Изменение статуса
 *               value:
 *                 status: "waiting"
 *                 notes: "Рекрутер запросил дополнительное время"
 *     responses:
 *       200:
 *         description: Статус рекрутера успешно обновлен
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
 *                   example: "Статус рекрутера обновлен"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recruiter:
 *                       $ref: '#/components/schemas/Recruiter'
 *       400:
 *         description: Ошибка валидации данных или бизнес-логики
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/BaseErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Ошибка валидации статуса
 *                 value:
 *                   success: false
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "status"
 *                       message: "Недопустимый статус рекрутера"
 *                       value: "акакак"
 *               businessLogicError:
 *                 summary: Ошибка бизнес-логики
 *                 value:
 *                   success: false
 *                   message: "Нельзя перейти из статуса \"waiting\" в \"got_offer\".\nРазрешенные переходы: in_process, rejected, archived, contacting"
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
 *       404:
 *         description: Рекрутер не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 */
router.patch('/:id/status',authorizeToken, RecruiterRoutesValidation.validateUpdateRecruiterStatus(), handleValidationErrors, RecruiterController.updateRecruiterStatus);
/**
 * @swagger
 * /recruiters/{id}/status:
 *   get:
 *     summary: Получить историю статусов рекрутера
 *     description: Возвращает историю изменений статусов для конкретного рекрутера
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID рекрутера
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
 *                   example: "История статусов рекрутера"
 *                 data:
 *                   type: object
 *                   properties:
 *                     statusHistory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StatusHistory'
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
 *                   error: 'Недостаточно прав для просмотра данных'
 *       404:
 *         description: Рекрутер не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 */
router.get('/:id/status',authorizeToken, StatusHistoryController.getRecruiterStatusHistory);

/**
 * @swagger
 * /recruiters/{id}/with-history:
 *   get:
 *     summary: Получить рекрутера с историей статусов
 *     description: Возвращает информацию о рекрутере вместе с его историей статусов
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID рекрутера
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
 *                   example: "Данные рекрутера с историей статусов"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recruiter:
 *                       $ref: '#/components/schemas/Recruiter'
 *                     statusHistory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StatusHistory'
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
 *                   error: 'Недостаточно прав для просмотра данных'
 *       404:
 *         description: Рекрутер не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseErrorResponse'
 */
router.get('/:id/with-history', authorizeToken, RecruiterController.getRecruiterWithHistory);



module.exports = router;
