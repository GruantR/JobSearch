const bot = require("./bot");
const authHandlers = require('./handlers/authHandlers');
const userHandlers = require('./handlers/userHandlers');
const SessionManager = require("./services/sessionManager");
const vacancyHandlers = require('./handlers/vacancyHandlers');
const { handleBotError } = require("../bot/utils/errorHandler");
const menuHandlers = require("./handlers/menuHandlers");
const { newGame, againGame, randomGameNumber } = require('./handlers/gameHandlers');

// 📋 КОМАНДЫ БОТА (упрощенный список)
bot.setMyCommands([
  { command: '/start', description: "Начальное приветствие" },
  { command: '/login', description: "Вход в систему" },
  { command: '/menu', description: "Главное меню (требуется авторизация)" },
  { command: '/game', description: "Просто игрулька (не требуется авторизация)" },
  { command: '/help', description: "Справка по командам" }
]);

// 🎯 ОБРАБОТЧИКИ КОМАНД
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  
  let message = `👋 Привет, ${userName}!\n\nЯ бот для управления вакансиями JobSearch.\n\n`;
  
  await bot.sendPhoto(chatId, 'https://tlgrm.ru/_/stickers/1b5/0ab/1b50abf8-8451-40ca-be37-ffd7aa74ec4d/50.jpg');
  
  if (SessionManager.isAuthenticated(chatId)) {
    const session = SessionManager.getSession(chatId);
    message += `✅ Вы вошли как: ${session.user.email}\n\n`;
    message += `Используйте /menu для доступа ко всем функциям`;
  } else {
    message += `Чтобы начать работу, войдите в систему:\n`;
    message += `/login - войти в систему\n`;
    message += `/help - доступные команды`;
  }

  await bot.sendMessage(chatId, message);
});

bot.onText(/\/login/, (msg) => {
  authHandlers.handleLoginCommand(bot, msg);
});

bot.onText(/\/logout/, (msg) => {
  authHandlers.handleLogoutCommand(msg);
});

bot.onText(/^\/me$/, async (msg) => {
  await userHandlers.handleMeAndProfileComand(msg);
});

bot.onText(/\/vacancies/, (msg) => {
  vacancyHandlers.handleVacanciesCommand(msg);
});

bot.onText(/\/vacancy (.+)/, (msg, match) => {
  vacancyHandlers.handleVacancyCommand(bot, msg, match);
});

bot.onText(/\/game/, async (msg) => {
  const chatId = msg.chat.id;
  await newGame(chatId);
});

bot.onText(/^\/menu$/, (msg) => {
  const chatId = msg.chat.id;
  if (!SessionManager.isAuthenticated(chatId)) {
    bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
    return;
  }
  menuHandlers.showMainMenu(chatId);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const isAuthenticated = SessionManager.isAuthenticated(chatId);

  let message = `🤖 **JobSearch Bot - Справка по командам**\n\n`;

  if (isAuthenticated) {
    message += `👨‍💼 **Основные команды:**\n`;
    message += `├ /menu - Главное меню\n`;
    message += `├ /me - Профиль\n`;
    message += `├ /vacancies - Ваши вакансии\n`;
    message += `└ /logout - Выйти\n\n`;
    
    message += `🎮 **Развлечения:**\n`;
    message += `└ /game - Мини-игра\n`;
  } else {
    message += `🔐 **Для начала работы:**\n`;
    message += `├ /start - Начать работу\n`;
    message += `├ /login - Войти в систему\n`;
    message += `└ /help - Справка\n`;

    message += `🎮 **Развлечения:**\n`;
    message += `└ /game - Мини-игра\n`;
  }

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// 📨 ОБРАБОТКА ОБЫЧНЫХ СООБЩЕНИЙ
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    if (!text || text.startsWith('/')) return;

    // 🔐 Обработка процесса логина
    const loginAttempt = SessionManager.getLoginAttempt(chatId);
    if (loginAttempt) {
      if (loginAttempt.step === 'email') {
        authHandlers.handleEmailInput(bot, msg);
      } else if (loginAttempt.step === 'password') {
        await authHandlers.handlePasswordInput(bot, msg);
      }
      return;
    }

    // ✏️ Обработка редактирования вакансии
    const session = SessionManager.getSession(chatId);
    if (session?.editingVacancy?.step === 'awaiting_input') {
      await vacancyHandlers.start2EditVacancyField(chatId, text, session);
      return;
    }

    bot.sendMessage(chatId, '🤔 Я понимаю только команды. Напиши /help для справки');

  } catch (error) {
    console.error('Ошибка в обработчике сообщений:', error);
    bot.sendMessage(chatId, '❌ Произошла непредвиденная ошибка');
  }
});

// 🔘 ОБРАБОТКА INLINE КНОПОК
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  try {
    // 📊 ВАКАНСИИ
    if (data.startsWith('vacancy_')) {
      const vacancyId = data.split('_')[1];
      await vacancyHandlers.handleVacancyCommand(chatId, vacancyId);
    }
    else if (data.startsWith('show_status_menu_')) {
      const vacancyId = data.replace('show_status_menu_', '');
      await vacancyHandlers.showStatusMenu(chatId, vacancyId, msg.message_id);
    }
    else if (data.startsWith('set_status_')) {
      const parts = data.split('_');
      const vacancyId = parts[2];
      const newStatus = parts[3];
      await vacancyHandlers.handleStatusChange(bot, chatId, vacancyId, newStatus, msg.message_id);
    }

    // ✏️ РЕДАКТИРОВАНИЕ ВАКАНСИЙ
    else if (data.startsWith('editVacancy_')) {
      const vacancyId = data.split('_')[1];
      await vacancyHandlers.handleVacancyCommand(chatId, vacancyId);
      vacancyHandlers.showEditMenu(chatId, vacancyId);
    }
    else if (data.startsWith('editDataVacancy_')) {
      const parts = data.split('_');
      const vacancyId = parts[1];
      const editModule = parts[2];
      await vacancyHandlers.startEditVacancyField(chatId, vacancyId, editModule);
      bot.sendMessage(chatId, 'Введите новое значение:');
    }
    else if (data.startsWith('cancel_editDataVacancy_')) {
      const vacancyId = data.split('_')[2];
      await vacancyHandlers.handleVacancyCommand(chatId, vacancyId);
      vacancyHandlers.showEditMenu(chatId, vacancyId);
    }
    else if (data.startsWith('cancel_editVacancy_')) {
      const vacancyId = data.split('_')[2];
      await vacancyHandlers.handleVacancyCommand(chatId, vacancyId);
    }

    // 📱 МЕНЮ
    else if (data === 'getVacancies') {
      await vacancyHandlers.handleVacanciesCommand(msg);
    }
    else if (data === 'menu_profile') {
      await userHandlers.handleMeAndProfileComand(msg);
    }
    else if (data === 'menu_logout') {
      authHandlers.handleLogoutCommand(msg);
    }
    else if (data === 'menu_analytics') {
      bot.sendMessage(chatId, "📊 Аналитика в разработке...");
    }
    else if (data === 'menu_recruiters') {
      bot.sendMessage(chatId, "👥 Рекрутеры в разработке...");
    }

    // 🎮 ИГРА
    else if (data === 'again_game') {
      await newGame(chatId);
    }
    else if (data.startsWith('game_keyboard')) {
      const selectedNumber = Number(data.split('_')[2]);
      const correctNumber = randomGameNumber[chatId];
      
      if (selectedNumber === correctNumber) {
        await bot.sendPhoto(chatId, 'https://cdn27.echosevera.ru/64809353eac9120dd845a103/6484502b61cba.jpg');
        await bot.sendMessage(chatId, `🎉 Ты угадал! Загаданное число: ${correctNumber}`, againGame);
      } else {
        await bot.sendPhoto(chatId, 'https://cs.pikabu.ru/img_n/2012-10_3/53z.jpg');
        await bot.sendMessage(chatId, `❌ Не угадал! Загаданное число: ${correctNumber}`, againGame);
      }
    }

    // ✅ Подтверждаем нажатие кнопки
    bot.answerCallbackQuery(callbackQuery.id);

  } catch (error) {
    console.error('Ошибка в callback_query:', error);
    bot.sendMessage(chatId, '❌ Произошла ошибка при обработке действия');
    bot.answerCallbackQuery(callbackQuery.id);
  }
});

console.log('✅ Команды бота зарегистрированы');