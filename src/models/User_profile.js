//src/models/User_profile.js
const sequelize = require('../config/db');
const DataTypes = require('sequelize');

const User_profile = sequelize.define ('User_profile', {
full_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        notEmpty: { msg: "ФИО не может быть пустым" },
        len: {
            args: [2, 100],
            msg: "ФИО должно быть от 2 до 100 символов"
        }
    }
},
phone_number: {
    type: DataTypes.STRING(20), // До 20 символов
    allowNull: true,
    validate: {
        is: {
            args: /^[\+]?[0-9\s\-\(\)]+$/, // +, цифры, пробелы, -, ()
            msg: "Некорректный формат номера телефона"
        },
        len: {
            args: [5, 20],
            msg: "Номер должен быть от 5 до 20 символов"
        }
    }
},
userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique:true,
}

},
{
    tableName: 'user_profiles'
})

module.exports = User_profile;