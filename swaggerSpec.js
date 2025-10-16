const swaggerJSDoc = require("swagger-jsdoc");

// Настройки для swagger-jsdoc
const options = {
  // Блок definition - основная информация о API
  definition: {
    // Спецификация OpenAPI
    openapi: "3.0.0", // Версия спецификации

    // Информация о API
    info: {
      title: "JobSearch API", // Название API
      version: "1.0.0", // Версия API
      description: "API для приложения поиска работы", // Описание
      contact: {
        name: "API Support", // Контактная информация
        email: "support@jobsearch.com",
      },
    },

    // Серверы, где доступно API
    servers: [
      {
        url: "http://localhost:3000/api", // URL для разработки
        description: "Development server",
      },
      //   {
      //     url: 'https://api.jobsearch.com/api',  // URL для продакшена
      //     description: 'Production server',
      //   },
    ],

    // 🔹 КОМПОНЕНТЫ ДЛЯ ПЕРЕИСПОЛЬЗОВАНИЯ
    components: {
      // Схемы безопасности (авторизация)
      securitySchemes: {
        bearerAuth: {
          // Название схемы (используется в роутах)
          type: "http", // Тип - HTTP авторизация
          scheme: "bearer", // Схема - Bearer token
          bearerFormat: "JWT", // Формат токена - JWT
          description:
            "JWT токен авторизации. Получите токен через эндпоинт /auth/login",
        },
      },

      // Модели данных (схемы)
      schemas: {
        // Модель пользователя
        User: {
          type: "object", // Тип объекта
          required: ["id", "email"], // Обязательные поля
          properties: {
            id: {
              type: "integer", // Числовой ID
              example: 1, // Пример значения
              description: "Уникальный идентификатор пользователя",
            },
            email: {
              type: "string",
              format: "email", // Специальный формат email
              example: "user@example.com",
              description: "Email пользователя",
            },
            createdAt: {
              type: "string",
              format: "date-time", // Формат даты-времени ISO
              example: "2024-01-15T10:30:00.000Z",
              description: "Дата создания пользователя",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-20T15:45:00.000Z",
              description: "Дата последнего обновления",
            },
          },
        },
        UserProfile: {
          type: "object",
          required: ["id", "userId"], // Обязательные поля
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Уникальный идентификатор профиля",
            },
            fullName: {
              type: "string",
              example: "Иван Иванов",
              description: "Полное имя пользователя",
              nullable: true,
            },
            phoneNumber: {
              type: "string",
              example: "+79991234567",
              description: "Номер телефона пользователя",
              nullable: true,
            },
            userId: {
              type: "integer",
              example: 1,
              description: "ID пользователя, к которому привязан профиль",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
              description: "Дата создания профиля",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-20T15:45:00.000Z",
              description: "Дата последнего обновления профиля",
            },
          },
        },

        Recruiter: {
          type: "object",
          required: ["id", "userId"], // Обязательные поля
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Уникальный идентификатор профиля",
            },
            userId: {
              type: "integer",
              example: 1,
              description: "ID пользователя, к которому привязан профиль",
            },
            fullName: {
              type: "string",
              example: "Иванов Иван Иванович",
              description: "ФИО рекретёра",
            },
            company: {
              type: "string",
              example: "Tech Company Inc.",
              description: "Название компании рекретёра",
            },
            linkedinUrl: {
              type: "string",
              example: "https://linkedin.com/in/ivanov",
              description: "Ссылка linkedin на рекретёра",
            },
            contactInfo: {
              type: "string",
              example: "ivanov@company.com, +79991234567",
              description: "Контактные данные для связи с рекретёром",
            },
            position: {
              type: "string",
              example: "HR Manager",
              description: "Занимаемая должность рекретёра в компании",
            },
            status: {
              type: "string",
              enum: [
                "contacting",
                "waiting",
                "in_process",
                "got_offer",
                "rejected",
                "archived",
              ],
              example: "contacting",
              description: "текущий статус по общению с рекрутером",
            },
            notes: {
              type: "string",
              example: "Очень отзывчивый рекрутер",
              description: "Любая заметка",
            },
            lastContactDate: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
              description: "Дата последнего изменения статуса",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
              description: "Дата создания профиля",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-20T15:45:00.000Z",
              description: "Дата последнего обновления профиля",
            },
          },
        },

        StatusHistory: {
            type: "object",
            required: ["id", "entityType", "entityId", "newStatus", "changedAt"],
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Уникальный идентификатор записи истории статусов",
              },
              entityType: {
                type: "string",
                enum: ["recruiter", "vacancy"],
                example: "recruiter",
                description: "Тип сущности, к которой относится история статусов",
              },
              entityId: {
                type: "integer",
                example: 1,
                description: "ID сущности (рекрутера или вакансии)",
              },
              oldStatus: {
                type: "string",
                example: "contacting",
                description: "Статус до изменения",
                nullable: true
              },
              newStatus: {
                type: "string",
                example: "waiting",
                description: "Статус после изменения",
              },
              notes: {
                type: "string",
                example: "Рекрутер запросил дополнительное время",
                description: "Заметка, оставленная при изменении статуса",
                nullable: true
              },
              changedAt: {
                type: "string",
                format: "date-time",
                example: "2024-01-15T10:30:00.000Z",
                description: "Дата и время изменения статуса",
              },
            },
          },

        // БАЗОВАЯ СХЕМА ОШИБКИ (общие поля)
        BaseErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
          required: ["success", "message"],
        },

        // КАСТОМНЫЕ ОШИБКИ (401, 403, 409, 500)
        CustomErrorResponse: {
          allOf: [{ $ref: "#/components/schemas/BaseErrorResponse" }],
        },

        // ОШИБКИ EXPRESS-VALIDATOR (400)
        ValidationErrorResponse: {
          allOf: [
            { $ref: "#/components/schemas/BaseErrorResponse" },
            {
              type: "object",
              properties: {
                errors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: {
                        type: "string",
                        example: "email",
                        description: "Название поля с ошибкой",
                      },
                      message: {
                        type: "string",
                        example: "Введите корректный email",
                        description: "Сообщение об ошибке",
                      },
                      value: {
                        type: "string",
                        example: "kon9mail.com",
                        description: "Некорректное значение от пользователя",
                      },
                    },
                  },
                },
              },
              required: ["errors"],
            },
          ],
        },

        // ОШИБКА С ТЕКСТОМ (401, 403, 500)
        ErrorWithTextResponse: {
          allOf: [
            { $ref: "#/components/schemas/BaseErrorResponse" },
            {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Детальное описание ошибки",
                },
              },
              required: ["error"],
            },
          ],
        },

        // Модель вакансии (пример для будущего использования)
        // Vacancy: {
        //   type: 'object',
        //   properties: {
        //     id: {
        //       type: 'integer',
        //       example: 1
        //     },
        //     companyName: {
        //       type: 'string',
        //       example: 'Google'
        //     },
        //     jobTitle: {
        //       type: 'string',
        //       example: 'Frontend Developer'
        //     },
        //     status: {
        //       type: 'string',
        //       enum: ['found', 'applied', 'waiting', 'interview', 'offer', 'rejected', 'archived'],
        //       example: 'found'
        //     }
        //   }
        // },


      },
    },

    // Глобальные теги для группировки эндпоинтов
    tags: [
      {
        name: "Users",
        description: "Операции с пользователями",
      },
      {
        name: "Auth",
        description: "Аутентификация и авторизация",
      },
      {
        name: "Vacancies",
        description: "Управление вакансиями",
      },
      {
        name: "Recruiters",
        description: "Управление рекрутерами",
      },
    ],
  },

  // Пути к файлам, где искать JSDoc комментарии с @swagger
  apis: [
    "./src/routes/*.js", // Все файлы в папке routes
    "./src/routes/**/*.js", // Все файлы во вложенных папках routes
    "./src/controllers/*.js", // Можно также документировать контроллеры
  ],
};

// Генерация спецификации Swagger
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
