//src/models/Vacancy.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Vacancy = sequelize.define(
  "Vacancy",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "User ID обязателен",
        },
        isInt: {
          msg: "User ID должен быть целым числом",
        },
      },
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Название компании обязательно",
        },
        notEmpty: {
          msg: "Название компании не может быть пустым",
        },
        len: {
          args: [1, 255],
          msg: "Название компании должно быть от 1 до 255 символов",
        },
      },
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Должность обязательна",
        },
        notEmpty: {
          msg: "Должность не может быть пустой",
        },
        len: {
          args: [1, 255],
          msg: "Должность должна быть от 1 до 255 символов",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 5000],
          msg: "Описание не должно превышать 5000 символов",
        },
      },
    },
    sourcePlatform: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [0, 100],
          msg: "Платформа не должна превышать 100 символов",
        },
      },
    },
    source_url: {
      type: DataTypes.STRING,
      validate: {
        isUrl: {
          msg: "URL источника должен быть валидной ссылкой",
        },
        len: {
          args: [0, 500],
          msg: "URL не должен превышать 500 символов",
        },
      },
    },
    salary: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [0, 100],
          msg: "Зарплата не должна превышать 100 символов",
        },
      },
    },
    status: {
      type: DataTypes.ENUM(
        "found", //   -- Найдена вакансия
        "applied", //   -- Откликнулся
        "waiting", //  -- В ожидании ответа
        "interview", //  -- Собеседование
        "offer", //  -- Оффер
        "rejected", //  -- Отказ
        "archived"
      ),
      defaultValue: "found",
      validate: {
        isIn: {
          args: [
            [
              "found",
              "applied",
              "waiting",
              "interview",
              "offer",
              "rejected",
              "archived",
            ],
          ],
          msg: "Недопустимый статус вакансии",
        },
      },
    },
    applicationDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: {
          msg: "Дата отклика должна быть валидной датой",
        },
      },
    },
    lastContactDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: {
          msg: "Дата последнего контакта должна быть валидной датой",
        },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 10000],
          msg: "Заметки не должны превышать 10000 символов",
        },
      },
    },
  },
  {
    tableName: "vacancy",
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["userId", "status"],
      },
      {
        fields: ["applicationDate"],
      },
    ],
  }
);

module.exports = Vacancy;
