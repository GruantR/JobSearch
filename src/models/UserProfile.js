//src/models/User_profile.js
const sequelize = require("../config/db");
const DataTypes = require("sequelize");
const { ValidationError } = require("../errors/customErrors");

const UserProfile = sequelize.define(
  "UserProfile",
  {
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      validate: {
        isValidFullName(value) {
          if (value && (value.length > 0)) {
            if (value.length < 2 || value.length > 100) {
              throw new ValidationError("ФИО должно быть от 2 до 100 символов");
            }
            if (!value.trim()) {
              throw new ValidationError("ФИО не может быть пустым");
            }
          }
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20), // До 20 символов
      allowNull: true,
      defaultValue: null,
      validate: {
        isValidPhone(value) {
          if (value && value.length > 0) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
            if (!phoneRegex.test(value)) {
              throw new ValidationError("Некорректный формат номера телефона");
            }
            if (value.length < 5 || value.length > 20) {
              throw new ValidationError("Номер должен быть от 5 до 20 символов");
            }
          }
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "user_profiles",
  }
);

module.exports = UserProfile;
