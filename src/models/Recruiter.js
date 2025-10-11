//src/models/Recruiters.js
const {DataTypes} = require ('sequelize');
const sequelize = require('../config/db');

const Recruiters = sequelize.define('Recruiters', {
    userId: {
        type:DataTypes.INTEGER,
        allowNull: false,
    },
    fullName: {
        type:DataTypes.STRING
    },
    company: {
        type:DataTypes.STRING 
    },
    linkedinUrl: {
        type:DataTypes.STRING 
    },
    contactInfo: {
        type:DataTypes.STRING 
    },
    position: {
        type:DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM(
          'contacting',
          'waiting',
          'in_process',
          'got_offer',
          'rejected',
          'archived'
        ),
        defaultValue: 'contacting'
    },
    notes: {
        type:DataTypes.TEXT 
    },
    lastContactDate: {
        type:DataTypes.DATE
    }
},{
    tableName: 'recruiters',
});

module.exports = Recruiters;