// usersServices.js
const { models } = require("../models/index");
const { User } = models;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {ConflictError, AuthenticationError} = require('../errors/customErrors')


class UsersServices {
  async createUser(userData) {
    const {email, password} = userData;
        // Проверка существования пользователя
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          throw new ConflictError('Пользователь с таким email уже существует');
        };
        const user = await User.create({email, password})
    return user;
  };

  async getUsers() {
    const users = await User.findAll({});
    return users;
  };

  async getUserById(id) {
    const user = await User.findByPk(id)
    return user;
  };

  async validatePassword(email, password) {
    const data = await User.findOne({
      where: { email: email }
    });
    
    if (!data) {
      throw new AuthenticationError ('Неверный email или пароль');
    }
    const isPasswordValid = await bcrypt.compare(password, data.password);
    if (!isPasswordValid) {
      throw new AuthenticationError ('Неверный email или пароль');
    };

    const token = jwt.sign(
      { userId: data.id.toString() },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );


    return {token,data};
  };


}

module.exports = new UsersServices();
