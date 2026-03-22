// src/migrations/[timestamp]-create-sessions.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаем таблицу sessions
    await queryInterface.createTable('sessions', {
      // chatId - первичный ключ (уникальный идентификатор чата Telegram)
      chatId: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      
      // userId - внешний ключ к таблице users
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE', // При удалении пользователя удаляются его сессии
        onUpdate: 'CASCADE'
      },
      
      // Время последней активности пользователя
      lastActivity: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      
      // Sequelize автоматически добавит эти поля если timestamps: true
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

    // Добавляем индексы для улучшения производительности
    await queryInterface.addIndex('sessions', ['userId'], {
      name: 'sessions_userId_index'
    });
    
    await queryInterface.addIndex('sessions', ['lastActivity'], {
      name: 'sessions_lastActivity_index'
    });
  },

  async down(queryInterface, Sequelize) {
    // Удаляем таблицу sessions (откат миграции)
    await queryInterface.dropTable('sessions');
  }
};

