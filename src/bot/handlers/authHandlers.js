const authService = require('../../services/authServices');
const sessionManager = require('../services/sessionManager');

class AuthHandlers {
  // Обработчик команды /login
  handleLoginCommand(bot, msg) {
    const chatId = msg.chat.id;
    
    
    // TODO: Проверить если пользователь УЖЕ вошёл
    // TODO: Если да - сообщить "Вы уже вошли"
    // TODO: Если нет - начать процесс логина
  }

  // Обработчик ввода email
  handleEmailInput(bot, msg) {
    const chatId = msg.chat.id;
    const email = msg.text;

    // TODO: Проверить формат email
    // TODO: Если формат неправильный - попросить ввести снова
    // TODO: Если правильный - сохранить email и попросить пароль
  }

  // Обработчик ввода пароля
  async handlePasswordInput(bot, msg) {
    const chatId = msg.chat.id;
    const password = msg.text;

    // TODO: Достать email из loginAttempt
    // TODO: Вызвать authService.authenticateUser(email, password)
    // TODO: Если успешно - создать сессию
    // TODO: Если ошибка - сообщить и очистить попытку
  }
}

module.exports = new AuthHandlers();