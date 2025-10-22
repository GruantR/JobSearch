//bot/comand.js
const bot = require("./bot");
const authHandlers = require('./handlers/authHandlers');
const SessionManager = require("./services/sessionManager");

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  let message = `👋 Привет, ${userName}!\n\nЯ бот для управления вакансиями JobSearch.\n\n`;
  if (SessionManager.isAuthenticated(chatId)) {
    const session = sessionManager.getSession(chatId);
    message += `✅ Вы вошли как: ${session.user.email}\n\n`;
    message += `Доступные команды:\n`;
    message += `/vacancies - ваши вакансии\n`;
    message += `/me - информация о профиле\n`;
    message += `/logout - выйти`;
  } else {
    message += `Чтобы начать работу, нужно войти в систему.\n\n`;
    message += `Используйте команду:\n`;
    message += `/login - войти в систему`;
  }

  bot.sendMessage(chatId, message);
});

// Обработчик команды /login
bot.onText(/\/login/, (msg) => {
  authHandlers.handleLoginCommand(bot, msg);
});


// Обработчик команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `📚 **Доступные команды:**\n\n` +
    `/start - начать работу\n` +
    `/help - эта справка\n` +
    `/login - войти в систему\n` +
    `🚀 _Развиваем бота дальше..._`,
    { parse_mode: 'Markdown' }
  );
});


bot.on('message', (msg)=>{
  const chatId = msg.chat.id;
  const text = msg.text;

  // Игнорируем служебные сообщения
  if (!text) return;

    // Пропускаем команды (они начинаются с /)
  if (text.startsWith('/')) return;

   // Проверяем, находится ли пользователь в процессе логина
  const loginAttempt = SessionManager.getLoginAttempt(chatId);
    if (loginAttempt) {
    if (loginAttempt.step === 'email') {
      // Пользователь вводит email
      authHandlers.handleEmailInput(bot, msg);
    } else if (loginAttempt.step === 'password') {
      // Пользователь вводит пароль
      authHandlers.handlePasswordInput(bot, msg);
    }
  } else {
    // Обычное сообщение (не команда и не процесс логина)
    bot.sendMessage(
      chatId,
      '🤔 Я пока понимаю только команды. Напиши /help чтобы узнать что я умею!'
    );
  }
})

console.log('✅ Команды бота зарегистрированы');

