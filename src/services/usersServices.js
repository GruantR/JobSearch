// src/services/usersServices.js
const { models } = require("../models/index");
const { User } = models;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  ConflictError,
  AuthenticationError,
  NotFoundError,
} = require("../errors/customErrors");

class UsersServices {

  async getUsers() {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    return users;
  }

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    return user;
  }

  async patchDataUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError("Пользователь не найден");
    }
    await user.update(updateData);

    return {
      id: user.id,
      email: user.email,
    };
  }

  async dropUser(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }
    await User.destroy({ where: { id } });
    console.log(`Пользователь ${user.email} (ID: ${user.id}) удален`);
    return {
      id: user.id,
      email: user.email
    };
  }
}

module.exports = new UsersServices();
