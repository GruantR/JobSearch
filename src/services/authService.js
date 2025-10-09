//src/services/authServices.js
const { models } = require("../models/index");
const { User, UserProfile } = models;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  ConflictError,
  AuthenticationError,
} = require("../errors/customErrors");



class AuthService {
  async createUser(userData) {
    const { email, password } = userData;
    // Проверка существования пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError("Пользователь с таким email уже существует");
    }
    const user = await User.create({ email, password });
    await UserProfile.create({ 
      userId: user.id
      // fullName и phoneNumber будут null по умолчанию
  });

    return await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
    });
  }

  async authenticateUser(email, password) {
    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new AuthenticationError("Неверный email или пароль");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Неверный email или пароль");
    }

    const token = jwt.sign(
      { userId: user.id.toString(), email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    return { token, user: { id: user.id, email: user.email } };
  }
};
module.exports = new AuthService();