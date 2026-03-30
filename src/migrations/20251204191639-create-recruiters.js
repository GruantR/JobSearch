'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recruiters', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      linkedinUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contactInfo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      position: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          'contacting',
          'waiting',
          'in_process',
          'got_offer',
          'rejected',
          'archived'
        ),
        allowNull: false,
        defaultValue: 'contacting',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      lastContactDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('recruiters', ['userId'], {
      name: 'recruiters_userId_index',
    });
    await queryInterface.addIndex('recruiters', ['userId', 'status'], {
      name: 'recruiters_userId_status_index',
    });
    await queryInterface.addIndex('recruiters', ['lastContactDate'], {
      name: 'recruiters_lastContactDate_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('recruiters');
  },
};
