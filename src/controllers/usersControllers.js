//usersControllers.js
const usersServices = require("../services/usersServices");
const { ValidationError } = require("../errors/customErrors");

class UsersControllers {
  async createUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ValidationError("Email и пароль обязательны");
      }
      const cleanEmail = email.trim().toLowerCase();
      const createdUser = await usersServices.createUser({
        email: cleanEmail,
        password,
      });
      res.status(201).json({
        success: true,
        message: "Пользователь успешно зарегистрирован",
        data: { createdUser },
      });
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      const tokenAndUser = await usersServices.authenticateUser(
        email,
        password
      );
      const { token, user } = tokenAndUser;
      res.json({
        success: true,
        message: "Успешный вход в систему",
        data: { token, user },
      });
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await usersServices.getUsers();
      res.json({
        success: true,
        data: { users },
      });
    } catch (err) {
      
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await usersServices.getUserById(req.userId);
      res.json({
        success: true,
        data: { user },
      });
    } catch (err) {
        next(err);
    }
  }
}

module.exports = new UsersControllers();
