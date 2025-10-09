//src/models/StatusHistory.js
const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const StatusHistory = sequelize.define("StatusHistory",{
    entityType: {
        type: DataTypes.ENUM('recruiter', 'vacancy'),
        allowNull: false
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    oldStatus: {
        type: DataTypes.STRING
    },
    newStatus: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT
    },
    changedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }

 },{
    tableName: 'status_history',
    timestamps: false // отключаем автоматические createdAt/updatedAt
});

module.exports = StatusHistory;