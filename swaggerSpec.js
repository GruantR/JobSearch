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
        {
          url: 'https://jobsearch-xsjk.onrender.com/api',  // URL для продакшена
          description: 'Production server',
        },
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

        Vacancy: {
            type: "object",
            required: ["id", "userId", "companyName", "jobTitle", "status"],
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Уникальный идентификатор вакансии",
              },
              userId: {
                type: "integer",
                example: 1,
                description: "ID пользователя, к которому привязана вакансия",
              },
              companyName: {
                type: "string",
                example: "Tech Company Inc.",
                description: "Название компании-работодателя",
              },
              jobTitle: {
                type: "string",
                example: "Frontend Developer",
                description: "Название должности",
              },
              description: {
                type: "string",
                example: "Разработка пользовательских интерфейсов на React и TypeScript",
                description: "Описание вакансии и требований",
                nullable: true
              },
              sourcePlatform: {
                type: "string",
                example: "hh.ru",
                description: "Платформа, где найдена вакансия",
                nullable: true
              },
              source_url: {
                type: "string",
                example: "https://hh.ru/vacancy/123456",
                description: "Ссылка на вакансию на источнике",
                nullable: true
              },
              salary: {
                type: "string",
                example: "от 150 000 руб.",
                description: "Информация о зарплате",
                nullable: true
              },
              status: {
                type: "string",
                enum: ["found", "applied", "waiting", "interview", "offer", "rejected", "archived"],
                example: "found",
                description: "Текущий статус вакансии в процессе отклика",
              },
              applicationDate: {
                type: "string",
                format: "date-time",
                example: "2024-01-15T10:30:00.000Z",
                description: "Дата отправки отклика на вакансию",
                nullable: true
              },
              lastContactDate: {
                type: "string",
                format: "date-time",
                example: "2024-01-20T15:45:00.000Z",
                description: "Дата последнего контакта по вакансии",
                nullable: true
              },
              notes: {
                type: "string",
                example: "Интересная вакансия с современным стеком технологий",
                description: "Дополнительные заметки по вакансии",
                nullable: true
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2024-01-15T10:30:00.000Z",
                description: "Дата создания записи о вакансии",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                example: "2024-01-20T15:45:00.000Z",
                description: "Дата последнего обновления вакансии",
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

            RecruitersStats: {
                type: "object",
                properties: {
                  contacting: {
                    type: "integer",
                    example: 5,
                    description: "Количество рекрутеров в статусе 'contacting'"
                  },
                  waiting: {
                    type: "integer", 
                    example: 3,
                    description: "Количество рекрутеров в статусе 'waiting'"
                  },
                  in_process: {
                    type: "integer",
                    example: 2,
                    description: "Количество рекрутеров в статусе 'in_process'"
                  },
                  got_offer: {
                    type: "integer",
                    example: 1,
                    description: "Количество рекрутеров в статусе 'got_offer'"
                  },
                  rejected: {
                    type: "integer",
                    example: 2,
                    description: "Количество рекрутеров в статусе 'rejected'"
                  },
                  archived: {
                    type: "integer",
                    example: 4,
                    description: "Количество рекрутеров в статусе 'archived'"
                  },
                  total: {
                    type: "integer",
                    example: 17,
                    description: "Общее количество рекрутеров"
                  }
                }
              },
              
              RecruitmentFunnel: {
                type: "object",
                properties: {
                  counts: {
                    type: "object",
                    properties: {
                      notContacted: {
                        type: "integer",
                        example: 5,
                        description: "Нашли, но еще не написали"
                      },
                      waitingResponse: {
                        type: "integer",
                        example: 3,
                        description: "Написали, ждем ответа"
                      },
                      activeConversations: {
                        type: "integer",
                        example: 2,
                        description: "Активно общаемся"
                      },
                      gotOffers: {
                        type: "integer",
                        example: 1,
                        description: "Получили офферы"
                      },
                      rejected: {
                        type: "integer",
                        example: 2,
                        description: "Получили отказы"
                      }
                    }
                  },
                  rates: {
                    type: "object",
                    properties: {
                      responseRate: {
                        type: "string",
                        example: "60.0%",
                        description: "Процент ответов на сообщения"
                      },
                      successRate: {
                        type: "string",
                        example: "16.7%",
                        description: "Процент офферов от всех контактов"
                      },
                      engagementRate: {
                        type: "string",
                        example: "17.6%",
                        description: "Общая активность"
                      }
                    }
                  }
                }
              },
              
              VacanciesStats: {
                type: "object",
                properties: {
                  found: {
                    type: "integer",
                    example: 10,
                    description: "Количество вакансий в статусе 'found'"
                  },
                  applied: {
                    type: "integer",
                    example: 8,
                    description: "Количество вакансий в статусе 'applied'"
                  },
                  waiting: {
                    type: "integer",
                    example: 4,
                    description: "Количество вакансий в статусе 'waiting'"
                  },
                  interview: {
                    type: "integer",
                    example: 3,
                    description: "Количество вакансий в статусе 'interview'"
                  },
                  offer: {
                    type: "integer",
                    example: 1,
                    description: "Количество вакансий в статусе 'offer'"
                  },
                  rejected: {
                    type: "integer",
                    example: 2,
                    description: "Количество вакансий в статусе 'rejected'"
                  },
                  archived: {
                    type: "integer",
                    example: 5,
                    description: "Количество вакансий в статусе 'archived'"
                  },
                  total: {
                    type: "integer",
                    example: 33,
                    description: "Общее количество вакансий"
                  }
                }
              },
              
              VacanciesFunnel: {
                type: "object",
                properties: {
                  counts: {
                    type: "object",
                    properties: {
                      found: {
                        type: "integer",
                        example: 10,
                        description: "Нашли, но не откликнулись"
                      },
                      applied: {
                        type: "integer",
                        example: 8,
                        description: "Откликнулись"
                      },
                      inProcess: {
                        type: "integer",
                        example: 4,
                        description: "Ведем общение"
                      },
                      interviews: {
                        type: "integer",
                        example: 3,
                        description: "На собеседованиях"
                      },
                      offers: {
                        type: "integer",
                        example: 1,
                        description: "Получили офферы"
                      },
                      rejected: {
                        type: "integer",
                        example: 2,
                        description: "Получили отказы"
                      }
                    }
                  },
                  rates: {
                    type: "object",
                    properties: {
                      applicationRate: {
                        type: "string",
                        example: "80.0%",
                        description: "Процент откликов от найденных"
                      },
                      interviewRate: {
                        type: "string",
                        example: "37.5%",
                        description: "Процент приглашений на собеседование от откликов"
                      },
                      offerRate: {
                        type: "string",
                        example: "33.3%",
                        description: "Процент офферов от собеседований"
                      },
                      successRate: {
                        type: "string",
                        example: "12.5%",
                        description: "Общий успех (офферы от всех откликов)"
                      }
                    }
                  }
                }
              }
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
