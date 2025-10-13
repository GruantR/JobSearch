//src/models/Recruiter.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Recruiters = sequelize.define(
  "Recruiter",
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
    fullName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
            msg: "ФИО не может быть пустым",
        },
        len: {
            args:[1,255],
            msg: "ФИО должно быть от 1 до 255 символов"

        },
      },
    },
    company: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
            msg: "Название компании не может быть пустым"
        },
        len: {
            args: [1,255],
             msg: "Название компании должно быть от 1 до 255 символов"
        }
      }
    },
    linkedinUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: {
            msg: "LinkedIn URL должен быть валидной ссылкой"
        },
        len: {
            args: [0,500],
            msg: "LinkedIn URL не должен превышать 500 символов"
        }
      }
    },
    contactInfo: {
      type: DataTypes.STRING,
      validate: {
        len: {
            args: [0, 500],
            msg: "Контактная информация не должна превышать 500 символов"
        }
    }
    },
    position: {
      type: DataTypes.STRING,
      validate: {
        len: {
            args: [0, 255],
            msg: "Должность не должна превышать 255 символов"
        }
    }
    },
    status: {
      type: DataTypes.ENUM(
        "contacting",
        "waiting",
        "in_process",
        "got_offer",
        "rejected",
        "archived"
      ),
      defaultValue: "contacting",
      validate: {
        isIn: {
            args: [['contacting', 'waiting', 'in_process', 'got_offer', 'rejected', 'archived']],
            msg: "Недопустимый статус рекрутера"
        }
    }
    },
    notes: {
      type: DataTypes.TEXT,
      validate: {
        len: {
            args: [0, 10000],
            msg: "Заметки не должны превышать 10000 символов"
        }
    }
    },
    lastContactDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: {
            msg: "Дата последнего контакта должна быть валидной датой"
        }
    }
    },
  },
  {
    tableName: "recruiters",
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['userId', 'status']
        },
        {
            fields: ['lastContactDate']
        }
    ]
  }
);

module.exports = Recruiters;
