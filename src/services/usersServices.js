// usersServices.js
const { models } = require("../models/index");
const { User } = models;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


class UsersServices {
  async createUser(userData) {
    return await User.create(userData);
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
      return res.status(401).json({ message: "Неверный email или пароль" });
    }
    const isPasswordValid = await bcrypt.compare(password, data.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    };

    const token = jwt.sign(
      { userId: data.id.toString() },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );


    return token;
  };


}

module.exports = new UsersServices();
