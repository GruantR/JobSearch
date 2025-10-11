//src/models/Vacancy.js

const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const Vacancy = sequelize.define('Vacancy',{
    companyName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jobTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    sourcePlatform: {
        type: DataTypes.STRING
    },
    source_url: {
        type: DataTypes.STRING
    },
    salary: {
        type: DataTypes.STRING
    },
    status: {
        type:DataTypes.ENUM(
            'found',        //   -- Найдена вакансия
            'applied',      //   -- Откликнулся
            'waiting',       //  -- В ожидании ответа
            'interview',     //  -- Собеседование
            'offer',         //  -- Оффер
            'rejected',      //  -- Отказ
            'archived'
        ),
                defaultValue: 'found'
    },
    applicationDate: {
        type: DataTypes.DATE
    },
    notes: {
        type: DataTypes.TEXT
    }

},{
    tableName: 'vacancy',
})

module.exports = Vacancy;