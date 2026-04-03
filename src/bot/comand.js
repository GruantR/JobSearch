const logger = require("../utils/logger");
const bot = require("./bot");
const authHandlers = require('./handlers/authHandlers');
const userHandlers = require('./handlers/userHandlers');
const SessionManager = require("./services/sessionManager");
const vacancyHandlers = require('./handlers/vacancyHandlers');
const { handleBotError } = require("../bot/utils/errorHandler");
const menuHandlers = require("./handlers/menuHandlers");
const { newGame, againGame, randomGameNumber } = require('./handlers/gameHandlers');


// Ультра-простая версия
if (!bot?.setMyCommands) {
  logger.info('⏸️  Бот отключен');
  module.exports = bot;
  return;
}

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
  
  if (await SessionManager.isAuthenticated(chatId)) {
    const session = await SessionManager.getSession(chatId);
    message += `✅ Вы вошли как: ${session.user.email}\n\n`;
    message += `Используйте /menu для доступа ко всем функциям`;
  } else {
    message += `Чтобы начать работу, войдите в систему:\n`;
    message += `/login - войти в систему\n`;
    message += `/help - доступные команды`;
  }

  await bot.sendMessage(chatId, message);
});

bot.onText(/\/login/, async (msg) => {
  await authHandlers.handleLoginCommand(bot, msg);
});

bot.onText(/\/logout/, async (msg) => {
  await authHandlers.handleLogoutCommand(msg);
});

bot.onText(/^\/me$/, async (msg) => {
  await userHandlers.handleMeAndProfileComand(msg);
});

bot.onText(/\/vacancies/, async (msg) => {
  await vacancyHandlers.handleVacanciesCommand(msg);
});

bot.onText(/\/vacancy (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const vacancyId = match[1];
  await vacancyHandlers.handleVacancyCommand(chatId, vacancyId);
});

bot.onText(/\/game/, async (msg) => {
  const chatId = msg.chat.id;
  await newGame(chatId);
});

bot.onText(/^\/menu$/, async (msg) => {
  const chatId = msg.chat.id;
  if (!(await SessionManager.isAuthenticated(chatId))) {
    await bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
    return;
  }
  menuHandlers.showMainMenu(chatId);
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const isAuthenticated = await SessionManager.isAuthenticated(chatId);

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

  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
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
        await authHandlers.handleEmailInput(bot, msg);
      } else if (loginAttempt.step === 'password') {
        await authHandlers.handlePasswordInput(bot, msg);
      }
      return;
    }

    // ✏️ Обработка редактирования вакансии
    const editingVacancy = SessionManager.getEditingVacancy(chatId);
    if (editingVacancy?.step === 'awaiting_input') {
      const session = await SessionManager.getSession(chatId);
      if (session) {
        await vacancyHandlers.start2EditVacancyField(chatId, text, session);
      }
      return;
    }

    await bot.sendMessage(chatId, '🤔 Я понимаю только команды. Напиши /help для справки');

  } catch (error) {
    logger.error('Ошибка в обработчике сообщений:', error);
    await bot.sendMessage(chatId, '❌ Произошла непредвиденная ошибка');
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
      await vacancyHandlers.showEditMenu(chatId, vacancyId);
    }
    else if (data.startsWith('editDataVacancy_')) {
      const parts = data.split('_');
      const vacancyId = parts[1];
      const editModule = parts[2];
      await vacancyHandlers.startEditVacancyField(chatId, vacancyId, editModule);
      await bot.sendMessage(chatId, 'Введите новое значение:');
    }
    else if (data.startsWith('cancel_editDataVacancy_')) {
      const vacancyId = data.split('_')[2];
      await vacancyHandlers.handleVacancyCommand(chatId, vacancyId);
      await vacancyHandlers.showEditMenu(chatId, vacancyId);
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
      await authHandlers.handleLogoutCommand(msg);
    }
    else if (data === 'menu_analytics') {
      await bot.sendMessage(chatId, "📊 Аналитика в разработке...");
    }
    else if (data === 'menu_recruiters') {
      await bot.sendMessage(chatId, "👥 Рекрутеры в разработке...");
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
    await bot.answerCallbackQuery(callbackQuery.id);

  } catch (error) {
    logger.error('Ошибка в callback_query:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при обработке действия');
    await bot.answerCallbackQuery(callbackQuery.id);
  }
});

logger.info('✅ Команды бота зарегистрированы');