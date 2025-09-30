//usersControllers.js
const usersServices = require("../services/usersServices");
const {ValidationError} = require('../errors/customErrors')

class UsersControllers {
  async createUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ValidationError("Email и пароль обязательны");
      }
      const cleanEmail = email.trim().toLowerCase();
      const createdUser = await usersServices.createUser({email: cleanEmail, password});
      res.status(201).json({
        success: true,
        message: "Пользователь успешно зарегистрирован",
        data: { createdUser },
      });
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req, res, next) {
    try {
      const result = await usersServices.getUsers();
      res.send(result);
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      const tokenAndUser = await usersServices.validatePassword(email, password);
      const {token, data: user} = tokenAndUser
      res.json({
        success: true,
        message: 'Успешный вход в систему',
        data: {
          token: token,
          user: { 
            id: user.id, 
            email: user.email, 
          }
        }
      });
  
    } catch (err) {
        next(err);
    }
  }
}

module.exports = new UsersControllers();
