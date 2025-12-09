//src/routes/vacanciesRoutes.js
const express = require('express');
const router = express.Router();
const VacanciesController = require('../controllers/VacanciesController');
const authorizeToken = require('../middleware/authorizeToken');
const StatusHistoryController = require('../controllers/statusHistoryController');
const VacancyRoutesValidation = require('../middleware/validators/vacancyRoutesValidation');
const handleValidationErrors = require('../middleware/errorHandlers/validationErrorHandler');


/**
 * @swagger
 * tags:
 *   name: Vacancies
 *   description: Управление вакансиями
 */

/**
 * @swagger
 * /vacancies:
 *   post:
 *     summary: Создать новую вакансию
 *     description: Создает новую вакансию для текущего пользователя
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - jobTitle
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: "Tech Company Inc."
 *                 description: "Название компании (1-255 символов)"
 *               jobTitle:
 *                 type: string
 *                 example: "Frontend Developer"
 *                 description: "Должность (1-255 символов)"
 *               description:
 *                 type: string
 *                 example: "Разработка пользовательских интерфейсов"
 *                 description: "Описание вакансии (до 5000 символов)"
 *               sourcePlatform:
 *                 type: string
 *                 example: "hh.ru"
 *                 description: "Платформа источника (до 100 символов)"
 *               sourceUrl:
 *                 type: string
 *                 example: "https://hh.ru/vacancy/123456"
 *                 description: "URL вакансии (до 500 символов)"
 *               salary:
 *                 type: string
 *                 example: "от 150 000 руб."
 *                 description: "Зарплата (до 100 символов)"
 *               applicationDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T10:30:00.000Z"
 *                 description: "Дата отклика"
 *               status:
 *                 type: string
 *                 enum: [found, applied, viewed, noResponse, invited, offer, rejected, archived]
 *                 example: "applied"
 *                 description: "Новый статус вакансии"
 *               notes:
 *                 type: string
 *                 example: "Интересная вакансия с современным стеком"
 *                 description: "Заметки (до 10000 символов)"
 *           examples:
 *             minimalData:
 *               summary: Минимальные данные
 *               value:
 *                 companyName: "Tech Company"
 *                 jobTitle: "Frontend Developer"
 *             fullData:
 *               summary: Все поля
 *               value:
 *                 companyName: "Tech Company Inc."
 *                 jobTitle: "Senior Frontend Developer"
 *                 description: "Разработка пользовательских интерфейсов на React"
 *                 sourcePlatform: "hh.ru"
 *                 sourceUrl: "https://hh.ru/vacancy/123456"
 *                 salary: "от 200 000 руб."
 *                 applicationDate: "2024-01-15T10:30:00.000Z"
 *                 status: applied
 *                 notes: "Очень перспективная вакансия"
 *     responses:
 *       201:
 *         description: Вакансия успешно создана
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
 *                   example: "Вакансия успешно создана"
 *                 data:
 *                   type: object
 *                   properties:
 *                     vacancy:
 *                       $ref: '#/components/schemas/Vacancy'
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
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "companyName"
 *                       message: "Название компании обязательно"
 *                       value: ""
 *                     - field: "jobTitle"
 *                       message: "Должность обязательна"
 *                       value: ""
 *                     - field: "sourceUrl"
 *                       message: "URL источника должен быть валидной ссылкой"
 *                       value: "invalid-url"
 *               singleError:
 *                 summary: Одиночная ошибка
 *                 value:
 *                   success: false
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "description"
 *                       message: "Описание не должно превышать 5000 символов"
 *                       value: "очень длинный текст..."
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
 *                   error: 'Недостаточно прав для внесения изменений в данную вакансию'
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
router.post('/', authorizeToken, VacancyRoutesValidation.validateCreateVacancy(), handleValidationErrors, VacanciesController.createVacancy);

/**
 * @swagger
 * /vacancies:
 *   get:
 *     summary: Получить список вакансий
 *     description: Возвращает список всех вакансий текущего пользователя
 *     tags: [Vacancies]
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
 *                   example: "Список вакансий"
 *                 data:
 *                   type: object
 *                   properties:
 *                     vacancies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Vacancy'
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
 *                   error: 'Недостаточно прав для чтения данных вакансии'
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
router.get('/', authorizeToken, VacanciesController.getVacancies);

/**
 * @swagger
 * /vacancies/{id}:
 *   get:
 *     summary: Получить вакансию по ID
 *     description: Возвращает информацию о конкретной вакансии
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID вакансии
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
 *                   example: "Данные вакансии"
 *                 data:
 *                   type: object
 *                   properties:
 *                     vacancy:
 *                       $ref: '#/components/schemas/Vacancy'
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
 *                   error: 'Недостаточно прав для чтения данных вакансии'
 *       404:
 *         description: Вакансия не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               NotFound:
 *                 summary: Вакансия не найдена
 *                 value:
 *                   success: false
 *                   message: "Вакансия не найдена"
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
router.get('/:id', authorizeToken, VacanciesController.getVacancy);

/**
 * @swagger
 * /vacancies/{id}:
 *   delete:
 *     summary: Удалить вакансию
 *     description: Удаляет вакансию по ID
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID вакансии
 *     responses:
 *       200:
 *         description: Вакансия успешно удалена
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
 *                   example: "Вакансия успешно удалена"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleteVacancy:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         companyName:
 *                           type: string
 *                           example: "Tech Company"
 *                         jobTitle:
 *                           type: string
 *                           example: "Frontend Developer"
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
 *                   error: 'Недостаточно прав для изменения данных вакансии'
 *       404:
 *         description: Вакансия не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               NotFound:
 *                 summary: Вакансия не найдена
 *                 value:
 *                   success: false
 *                   message: "Вакансия не найдена"
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
router.delete('/:id', authorizeToken, VacanciesController.deleteVacancy);

/**
 * @swagger
 * /vacancies/{id}:
 *   patch:
 *     summary: Обновить данные вакансии
 *     description: Обновляет информацию о вакансии (кроме статуса)
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID вакансии
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: "New Company Inc."
 *               jobTitle:
 *                 type: string
 *                 example: "Senior Frontend Developer"
 *               description:
 *                 type: string
 *                 example: "Обновленное описание"
 *               sourcePlatform:
 *                 type: string
 *                 example: "linkedin"
 *               sourceUrl:
 *                 type: string
 *                 example: "https://linkedin.com/jobs/view/123"
 *               salary:
 *                 type: string
 *                 example: "от 250 000 руб."
 *               applicationDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-20T15:45:00.000Z"
 *               notes:
 *                 type: string
 *                 example: "Обновленные заметки"
 *           examples:
 *             updateCompany:
 *               summary: Обновление компании
 *               value:
 *                 companyName: "New Company Inc."
 *             updateMultiple:
 *               summary: Обновление нескольких полей
 *               value:
 *                 companyName: "New Company Inc."
 *                 jobTitle: "Senior Frontend Developer"
 *                 salary: "от 250 000 руб."
 *     responses:
 *       200:
 *         description: Данные вакансии успешно обновлены
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
 *                   example: "Данные вакансии обновлены"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updateVacancy:
 *                       $ref: '#/components/schemas/Vacancy'
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
 *                       message: "Для изменения статуса используйте специальный метод PATCH /api/vacancies/:id/status"
 *                       value: "applied"
 *               multipleErrors:
 *                 summary: Множественные ошибки валидации
 *                 value:
 *                   success: false
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "companyName"
 *                       message: "Название компании обязательно"
 *                       value: ""
 *                     - field: "jobTitle"
 *                       message: "Должность обязательна"
 *                       value: ""
 *                     - field: "sourceUrl"
 *                       message: "URL источника должен быть валидной ссылкой"
 *                       value: "invalid-url"
 *               singleError:
 *                 summary: Одиночная ошибка
 *                 value:
 *                   success: false
 *                   message: "Ошибка валидации данных"
 *                   errors:
 *                     - field: "description"
 *                       message: "Описание не должно превышать 5000 символов"
 *                       value: "очень длинный текст..."
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
 *                   error: 'Недостаточно прав для изменения данных вакансии'
 *       404:
 *         description: Вакансия не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               NotFound:
 *                 summary: Вакансия не найдена
 *                 value:
 *                   success: false
 *                   message: "Вакансия не найдена"
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
router.patch('/:id', authorizeToken, VacancyRoutesValidation.validateUpdateVacancy(), handleValidationErrors, VacanciesController.patchVacancyData);

/**
 * @swagger
 * /vacancies/{id}/status:
 *   patch:
 *     summary: Обновить статус вакансии
 *     description: Изменяет статус вакансии и создает запись в истории статусов
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID вакансии
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
 *                 enum: [found, applied, viewed, noResponse, invited, offer, rejected, archived]
 *                 example: "applied"
 *                 description: "Новый статус вакансии"
 *               notes:
 *                 type: string
 *                 example: "Отправил резюме и сопроводительное письмо"
 *                 description: "Заметки к изменению статуса"
 *           examples:
 *             changeStatus:
 *               summary: Изменение статуса
 *               value:
 *                 status: "applied"
 *                 notes: "Отправил резюме и сопроводительное письмо"
 *     responses:
 *       200:
 *         description: Статус вакансии успешно обновлен
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
 *                   example: "Статус вакансии обновлен"
 *                 data:
 *                   type: object
 *                   properties:
 *                     vacancy:
 *                       $ref: '#/components/schemas/Vacancy'
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
 *                       message: "Недопустимый статус вакансии"
 *                       value: "invalid_status"
 *               businessLogicError:
 *                 summary: Ошибка бизнес-логики
 *                 value:
 *                   success: false
 *                   message: "Нельзя перейти из статуса \"found\" в \"offer\". Разрешенные переходы: applied, viewed, noResponse, invited, archived"
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
 *                   error: 'Недостаточно прав для изменения данных вакансии'
 *       404:
 *         description: Вакансия не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               NotFound:
 *                 summary: Вакансия не найдена
 *                 value:
 *                   success: false
 *                   message: "Вакансия не найдена"
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
router.patch('/:id/status', authorizeToken, VacancyRoutesValidation.validateUpdateVacancyStatus(), handleValidationErrors, VacanciesController.updateVacancyStatus);

/**
 * @swagger
 * /vacancies/{id}/status:
 *   get:
 *     summary: Получить историю статусов вакансии
 *     description: Возвращает историю изменений статусов для конкретной вакансии
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID вакансии
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
 *                   example: "История статусов вакансии"
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
 *                   error: 'Недостаточно прав для чтения данных вакансии'
 *       404:
 *         description: Вакансия не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               NotFound:
 *                 summary: Вакансия не найдена
 *                 value:
 *                   success: false
 *                   message: "Вакансия не найдена"
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
router.get('/:id/status',authorizeToken, StatusHistoryController.getVacanciesStatusHistory);

/**
 * @swagger
 * /vacancies/{id}/with-history:
 *   get:
 *     summary: Получить вакансию с историей статусов
 *     description: Возвращает информацию о вакансии вместе с ее историей статусов
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID вакансии
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
 *                   example: "Данные вакансии с историей статусов"
 *                 data:
 *                   type: object
 *                   properties:
 *                     vacancy:
 *                       $ref: '#/components/schemas/Vacancy'
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
 *                   error: 'Недостаточно прав для чтения данных вакансии'
 *       404:
 *         description: Вакансия не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             examples:
 *               NotFound:
 *                 summary: Вакансия не найдена
 *                 value:
 *                   success: false
 *                   message: "Вакансия не найдена"
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
router.get('/:id/with-history', authorizeToken, VacanciesController.getVacancyWithHistory);

module.exports = router;
