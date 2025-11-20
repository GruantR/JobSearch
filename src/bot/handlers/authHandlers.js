//src/bot/handlers/authHandlers.js
const sessionManager = require("../services/sessionManager");
const AuthService = require("../../services/authService");
const menuHandlers = require("./menuHandlers");
const bot = require("../bot");
const { handleBotError } = require("../utils/errorHandler");

class AuthHandlers {
  // Обработчик команды /login
  handleLoginCommand(bot, msg) {
    const chatId = msg.chat.id;

    if (sessionManager.isAuthenticated(chatId)) {
      // Пользователь уже вошёл - получить его сессию и сказать "Вы уже вошли как ..."
      const session = sessionManager.getSession(chatId);
      bot.sendMessage(chatId, `Вы уже вошли как ${session.user.email}`);
    } else {
      // Пользователь не вошёл - начать процесс логина
      // и отправить сообщение "Введите email:"
      sessionManager.startLoginAttempt(chatId);
      bot.sendMessage(chatId, "Введите ваш email:");
    }

    // TODO: Проверить если пользователь УЖЕ вошёл
    // TODO: Если да - сообщить "Вы уже вошли"
    // TODO: Если нет - начать процесс логина
  }

  handleLogoutCommand(msg) {
    const chatId = msg.chat.id;
    if (!sessionManager.isAuthenticated(chatId)) {
      bot.sendMessage(chatId, `Вы не в системе`);
      return;
    } else {
      const session = sessionManager.getSession(chatId);
      const userEmail = session.user.email;
      sessionManager.deleteSession(chatId);
      bot.sendMessage(
        chatId,
        `✅ Успешный выход из системы\n\n` +
          `До свидания, ${userEmail}!\n\n` +
          `Чтобы снова воспользоваться ботом, используйте /login`
      );
    }
  }

  // Обработчик ввода email
  handleEmailInput(bot, msg) {
    const chatId = msg.chat.id;
    const email = msg.text;

    const attempt = sessionManager.getLoginAttempt(chatId);

    //Проверяем что пользователь действительно в процессе логина
    if (!attempt) {
      bot.sendMessage(chatId, "❌ Сначала используйте /login");
      return;
    }
    if (email.length < 3 || !email.includes("@") || !email.includes(".")) {
      bot.sendMessage(chatId, "❌ Это не похоже на email. Попробуйте снова:");
      return;
    }

    if (email.length > 100) {
      bot.sendMessage(chatId, "❌ Email слишком длинный. Попробуйте снова:");
      return;
    }
    sessionManager.setLoginEmail(chatId, email);
    bot.sendMessage(chatId, "🔒 Введите пароль:");

    // TODO: Проверить формат email
    // TODO: Если формат неправильный - попросить ввести снова
    // TODO: Если правильный - сохранить email и попросить пароль
  }

  // Обработчик ввода пароля
  async handlePasswordInput(bot, msg) {
    const chatId = msg.chat.id;
    const password = msg.text;
    const attempt = sessionManager.getLoginAttempt(chatId);
    // Проверяем что есть активная попытка логина
    if (!attempt || !attempt.email) {
      bot.sendMessage(chatId, "❌ Сначала введите email через /login");
      return;
    }
    if (password.length < 6) {
      bot.sendMessage(
        chatId,
        "❌ пароль не может быть короче 6 смволов. Попробуйте снова:"
      );
      return;
    }

    try {
      const result = await AuthService.authenticateUser(
        attempt.email,
        password
      );
      sessionManager.createSession(chatId, result.user);
      sessionManager.clearLoginAttempt(chatId);
       // 🔥 ПОКАЗЫВАЕМ ГЛАВНОЕ МЕНЮ ПОСЛЕ УСПЕШНОГО ЛОГИНА
      menuHandlers.showMainMenu(chatId, `✅ Вы вошли как ${result.user.email}`);
     
 
    } catch (error) {
      const message = handleBotError(error);
      bot.sendMessage(chatId, message);
      sessionManager.clearLoginAttempt(chatId);

      // TODO: Достать email из loginAttempt
      // TODO: Вызвать authService.authenticateUser(email, password)
      // TODO: Если успешно - создать сессию
      // TODO: Если ошибка - сообщить и очистить попытку
    }
  }
}

module.exports = new AuthHandlers();
