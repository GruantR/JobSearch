const jwt = require("jsonwebtoken");
const { models } = require("../models/index");
const { User } = models;
const {
  AuthenticationError,
  ForbiddenError,
} = require("../errors/customErrors");

const authorizeToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Проверяем наличие заголовка
    if (!authHeader) {
      throw new AuthenticationError(
        "Требуется авторизация"
      );
    }

    // Извлекаем токен (Bearer <token>)
    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AuthenticationError(
        "Токен отсутствует"
      );
    }

    // Верифицируем токен с помощью async/await
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Проверяем, существует ли пользователь
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      throw new AuthenticationError("Пользователь не найден");
    }

    // Добавляем данные пользователя в запрос
    req.userId = decoded.userId;
    req.user = user;

    next();
  } catch (error) {
      console.error("Ошибка в authorizeToken:", error);
    // Если ошибка уже является нашей кастомной ошибкой - просто передаем дальше
    if (
      error instanceof AuthenticationError ||
      error instanceof ForbiddenError
    ) {
      return next(error);
    }



    // Детальная обработка разных типов JWT ошибок
    if (error.name === "JsonWebTokenError") {
      return next(new AuthenticationError("Неверный токен"));
    }

    if (error.name === "TokenExpiredError") {
      return next(new AuthenticationError("Токен просрочен"));
    }

    // Любые другие ошибки
    return next(new AuthenticationError("Ошибка проверки токена"));
  }
};

module.exports = authorizeToken;
