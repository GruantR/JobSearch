//models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require("bcrypt");

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: "Некорректный формат email" },
            notNull: { msg: "Email обязателен для заполнения" }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [6, 100],
                msg: "Пароль должен быть не короче 6 символов"
            }
        }
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
            beforeUpdate: async (user) => {
        // Проверяем, изменился ли пароль
        if (user.changed('password') && user.password) {
            user.password = await bcrypt.hash(user.password, 10);
           /* 
           user.changed('password') - Sequelize автоматически отслеживает измененные поля
            Хук срабатывает автоматически при любом обновлении через Sequelize
            Не нужно писать дополнительный код в сервисах
            */
        }
        
    }
    }

});
module.exports = User;