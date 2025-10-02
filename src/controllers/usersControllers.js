//src/controllers/usersControllers.js
const usersServices = require("../services/usersServices");
const {
  ValidationError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} = require("../errors/customErrors");

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
      if (!email || !password) {
        throw new ValidationError("Email и пароль обязательны");
      }
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
        message: "Список всех пользователей системы",
        data: { users },
      });
    } catch (err) {}
  }

  async getCurrentUser(req, res, next) {
    try {
      if (req.params.id !== req.userId) {
        throw new ForbiddenError("Нет доступа к данному ресурсу");
      }
      const user = await usersServices.getUserById(req.userId);

      if (!user) {
        throw new NotFoundError("Пользователь не найден");
      }
      res.json({
        success: true,
        message: `Инофрмация пользователя ${req.user.email}`,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateDataCurrentUser(req, res, next) {
    try {
      if (req.params.id !== req.userId) {
        throw new ForbiddenError("Нет доступа к данному ресурсу");
      }
      const updateFields = {};
      if (req.body) {
        if (req.body.email) {
          updateFields.email = req.body.email;
        }
        if (req.body.password) {
          updateFields.password = req.body.password;
        }
      }
      if (Object.keys(updateFields).length === 0) {
        throw new BadRequestError("Нет данных для обновления");
      }
      const user = await usersServices.patchDataUser(req.userId, updateFields);

      res.json({
        success: true,
        message: "Данные успешно обновлены",
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteCurrentUser(req, res, next) {
    try {
      if (req.params.id !== req.userId) {
        throw new ForbiddenError(
          `Нет доступа к данному ресурсу, Ваш id: ${req.userId}`
        );
      }
      const deletedUser = await usersServices.dropUser(req.userId);
      res.json({
        success: true,
        message: "Пользователь успешно удален из базы данных",
        data: { deletedUser },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UsersControllers();
