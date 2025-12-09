// src/migrations/[timestamp]-create-users.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Создаем таблицу users - ТОЧНО как в вашей модели
  await queryInterface.createTable('users', {
      // Поле id - Sequelize добавит его автоматически, но нужно явно указать
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      
      // Sequelize автоматически добавит эти поля если timestamps: true
      // Но в миграции мы должны их явно указать
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Добавляем индекс для email (это улучшает производительность)
    await queryInterface.addIndex('users', ['email'], {
      name: 'users_email_index',
      unique: true  // потому что email уникальный
    });
  },

  async down (queryInterface, Sequelize) {
    // Удаляем таблицу users (откат миграции)
    await queryInterface.dropTable('users');
  }
};
