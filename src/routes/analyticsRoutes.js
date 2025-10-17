//src/routes/analyticsRoutes.js
const express = require ('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const authorizeToken = require('../middleware/authorizeToken');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Аналитика и статистика по рекрутерам и вакансиям
 */
/**
 * @swagger
 * /analytics/recruiters-stats:
 *   get:
 *     summary: Базовая статистика по рекрутерам
 *     description: Возвращает общее количество рекрутеров по статусам для текущего пользователя
 *     tags: [Analytics]
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
 *                   example: "Базовая статистика по рекрутерам: общее количество по статусам"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         contacting:
 *                           type: integer
 *                           example: 5
 *                           description: "Количество рекрутеров в статусе 'contacting'"
 *                         waiting:
 *                           type: integer
 *                           example: 3
 *                           description: "Количество рекрутеров в статусе 'waiting'"
 *                         in_process:
 *                           type: integer
 *                           example: 2
 *                           description: "Количество рекрутеров в статусе 'in_process'"
 *                         got_offer:
 *                           type: integer
 *                           example: 1
 *                           description: "Количество рекрутеров в статусе 'got_offer'"
 *                         rejected:
 *                           type: integer
 *                           example: 2
 *                           description: "Количество рекрутеров в статусе 'rejected'"
 *                         archived:
 *                           type: integer
 *                           example: 4
 *                           description: "Количество рекрутеров в статусе 'archived'"
 *                         total:
 *                           type: integer
 *                           example: 17
 *                           description: "Общее количество рекрутеров"
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
 *                   error: 'Недостаточно прав для чтения данных'
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

router.get('/recruiters-stats', authorizeToken, AnalyticsController.getRecruitersStats);

/**
 * @swagger
 * /analytics/recruitment-funnel:
 *   get:
 *     summary: Воронка эффективности работы с рекрутерами
 *     description: Возвращает аналитику по эффективности взаимодействия с рекрутерами с абсолютными числами и процентами
 *     tags: [Analytics]
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
 *                   example: "Воронка эффективности работы с рекрутерами. Counts - абсолютные числа, Rates - проценты эффективности. Response Rate - процент ответов на сообщения, Success Rate - процент офферов от всех контактов, Engagement Rate - общая активность."
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         counts:
 *                           type: object
 *                           properties:
 *                             notContacted:
 *                               type: integer
 *                               example: 5
 *                               description: "Нашли, но еще не написали"
 *                             waitingResponse:
 *                               type: integer
 *                               example: 3
 *                               description: "Написали, ждем ответа"
 *                             activeConversations:
 *                               type: integer
 *                               example: 2
 *                               description: "Активно общаемся"
 *                             gotOffers:
 *                               type: integer
 *                               example: 1
 *                               description: "Получили офферы"
 *                             rejected:
 *                               type: integer
 *                               example: 2
 *                               description: "Получили отказы"
 *                         rates:
 *                           type: object
 *                           properties:
 *                             responseRate:
 *                               type: string
 *                               example: "60.0%"
 *                               description: "Процент ответов на сообщения"
 *                             successRate:
 *                               type: string
 *                               example: "16.7%"
 *                               description: "Процент офферов от всех контактов"
 *                             engagementRate:
 *                               type: string
 *                               example: "17.6%"
 *                               description: "Общая активность"
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
 *                   error: 'Недостаточно прав для чтения данных'
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

router.get('/recruitment-funnel', authorizeToken, AnalyticsController.getRecruitmentFunnel);

/**
 * @swagger
 * /analytics/vacancies-stats:
 *   get:
 *     summary: Базовая статистика по вакансиям
 *     description: Возвращает общее количество вакансий по статусам для текущего пользователя
 *     tags: [Analytics]
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
 *                   example: "Базовая статистика по вакансиям: общее количество по статусам"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         found:
 *                           type: integer
 *                           example: 10
 *                           description: "Количество вакансий в статусе 'found'"
 *                         applied:
 *                           type: integer
 *                           example: 8
 *                           description: "Количество вакансий в статусе 'applied'"
 *                         waiting:
 *                           type: integer
 *                           example: 4
 *                           description: "Количество вакансий в статусе 'waiting'"
 *                         interview:
 *                           type: integer
 *                           example: 3
 *                           description: "Количество вакансий в статусе 'interview'"
 *                         offer:
 *                           type: integer
 *                           example: 1
 *                           description: "Количество вакансий в статусе 'offer'"
 *                         rejected:
 *                           type: integer
 *                           example: 2
 *                           description: "Количество вакансий в статусе 'rejected'"
 *                         archived:
 *                           type: integer
 *                           example: 5
 *                           description: "Количество вакансий в статусе 'archived'"
 *                         total:
 *                           type: integer
 *                           example: 33
 *                           description: "Общее количество вакансий"
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
 *                   error: 'Недостаточно прав для чтения данных'
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

router.get ('/vacancies-stats', authorizeToken, AnalyticsController.getVacanciesStats);

/**
 * @swagger
 * /analytics/vacancies-funnel:
 *   get:
 *     summary: Воронка эффективности откликов на вакансии
 *     description: Возвращает аналитику по эффективности откликов на вакансии с абсолютными числами и процентами
 *     tags: [Analytics]
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
 *                   example: "Воронка эффективности откликов на вакансии. Counts - абсолютные числа, Rates - проценты эффективности. Application Rate - как часто откликаетесь на найденное, Interview Rate - как часто получаете собеседования, Offer Rate - успешность собеседований, Success Rate - общая эффективность поиска."
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         counts:
 *                           type: object
 *                           properties:
 *                             found:
 *                               type: integer
 *                               example: 10
 *                               description: "Нашли, но не откликнулись"
 *                             applied:
 *                               type: integer
 *                               example: 8
 *                               description: "Откликнулись"
 *                             inProcess:
 *                               type: integer
 *                               example: 4
 *                               description: "Ведем общение"
 *                             interviews:
 *                               type: integer
 *                               example: 3
 *                               description: "На собеседованиях"
 *                             offers:
 *                               type: integer
 *                               example: 1
 *                               description: "Получили офферы"
 *                             rejected:
 *                               type: integer
 *                               example: 2
 *                               description: "Получили отказы"
 *                         rates:
 *                           type: object
 *                           properties:
 *                             applicationRate:
 *                               type: string
 *                               example: "80.0%"
 *                               description: "Процент откликов от найденных"
 *                             interviewRate:
 *                               type: string
 *                               example: "37.5%"
 *                               description: "Процент приглашений на собеседование от откликов"
 *                             offerRate:
 *                               type: string
 *                               example: "33.3%"
 *                               description: "Процент офферов от собеседований"
 *                             successRate:
 *                               type: string
 *                               example: "12.5%"
 *                               description: "Общий успех (офферы от всех откликов)"
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
 *                   error: 'Недостаточно прав для чтения данных'
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
router.get('/vacancies-funnel', authorizeToken, AnalyticsController.getVacanciesFunnel);

module.exports = router;