'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vacancy', {
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
      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jobTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sourcePlatform: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sourceUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salary: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          'found',
          'applied',
          'viewed',
          'noResponse',
          'invited',
          'offer',
          'rejected',
          'archived'
        ),
        allowNull: false,
        defaultValue: 'found',
      },
      applicationDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastContactDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('vacancy', ['userId'], {
      name: 'vacancy_userId_index',
    });
    await queryInterface.addIndex('vacancy', ['userId', 'status'], {
      name: 'vacancy_userId_status_index',
    });
    await queryInterface.addIndex('vacancy', ['applicationDate'], {
      name: 'vacancy_applicationDate_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vacancy');
  },
};
