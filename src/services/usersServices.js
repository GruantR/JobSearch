// usersServices.js
const { models } = require("../models/index");
const { User } = models;
const bcrypt = require("bcrypt");

class UsersServices {
  async createUser(userData) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const newUser = {
      ...userData,
      password: hashedPassword,
    };
    return await User.create(newUser);
  }

  async getUsers() {
    const users = await User.findAll({});
    return users;
  }
}

module.exports = new UsersServices();
