//src/models/Session.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Session = sequelize.define(
  "Session",
  {
    chatId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      validate: {
        notNull: { msg: "ChatId обязателен для заполнения" },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      validate: {
        notNull: { msg: "UserId обязателен для заполнения" },
      },
    },
    lastActivity: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sessions",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["lastActivity"],
      },
    ],
  }
);

module.exports = Session;

