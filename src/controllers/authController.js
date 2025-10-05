//src/controllers/authController.js
const AuthService = require('../services/authServices');
const {
    ValidationError,
  } = require("../errors/customErrors");

class AuthController {
    async createUser(req, res, next) {
        try {
          const { email, password } = req.body;
          if (!email || !password) {
            throw new ValidationError("Email и пароль обязательны");
          }
          const cleanEmail = email.trim().toLowerCase();
          const createdUser = await AuthService.createUser({
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
          if (!email || !password) {
            throw new ValidationError("Email и пароль обязательны");
          }
          const tokenAndUser = await AuthService.authenticateUser(
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
}

module.exports = new AuthController()