'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('status_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      entityType: {
        type: Sequelize.ENUM('recruiter', 'vacancy'),
        allowNull: false,
      },
      entityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      oldStatus: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      newStatus: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      changedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('status_history', ['entityType', 'entityId'], {
      name: 'status_history_entity_index',
    });
    await queryInterface.addIndex('status_history', ['changedAt'], {
      name: 'status_history_changedAt_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('status_history');
  },
};
