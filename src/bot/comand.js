//bot/comand.js
const bot = require("./bot");
const authHandlers = require('./handlers/authHandlers');
const userHandlers = require('./handlers/userHandlers');
const SessionManager = require("./services/sessionManager");
const vacancyHandlers = require('./handlers/vacancyHandlers');
const VacanciesService = require('../services/vacanciesService');
const { handleBotError } = require("../bot/utils/errorHandler");

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  let message = `👋 Привет, ${userName}!\n\nЯ бот для управления вакансиями JobSearch.\n\n`;
  if (SessionManager.isAuthenticated(chatId)) {
    const session = SessionManager.getSession(chatId);
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

// Обработчик команды /login
bot.onText(/\/logout/, (msg) => {
  authHandlers.handleLogoutCommand(bot, msg);
});

bot.onText(/\/me/, (msg) => {
  userHandlers.handleMeAndProfileComand(bot, msg);
});

bot.onText(/\/vacancies/, (msg) => {
  vacancyHandlers.handleVacanciesCommand(bot, msg);
});

bot.onText(/\/vacancy (.+)/, (msg, match) => {
  vacancyHandlers.handleVacancyCommand(bot, msg, match);
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

// 📋 ОБРАБОТКА ОБЫЧНЫХ СООБЩЕНИЙ (не команд)
bot.on('message', async (msg)=>{
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

  const session = SessionManager.getSession(chatId);
if (session && session.editingVacancy && session.editingVacancy.step === 'awaiting_input') {
  try {
    const { vacancyId, field } = session.editingVacancy;
    
    // Создаем объект с обновляемыми данными
    const updateData = { [field]: text };
    
    // Используем существующий метод обновления вакансии
    await VacanciesService.updateVacancy(vacancyId, session.user.id, updateData);
    
    // Показываем успех
    bot.sendMessage(chatId, "✅ Изменения сохранены!");
    
    // Возвращаем в меню редактирования
    session.editingVacancy.step = 'menu';
    delete session.editingVacancy.field;
    
    vacancyHandlers.showEditMenu(bot, chatId, vacancyId);
    
  } catch (error) {
    const message = handleBotError(error);
    bot.sendMessage(chatId, `❌ Ошибка: ${message}`);
  }
  return;
}
})

///////////////////////////////////////
// Обработчик нажатий на inline кнопки
/*
Пользователь: Нажимает кнопку
↓
Telegram: Отправляет callback_query с данными "vacancy_123"
↓
Бот: Извлекает ID вакансии (123)
↓
Бот: Создает mockMsg с текстом "/vacancy 123"
↓
Бот: Вызывает handleVacancyCommand как будто пользователь ввел команду
↓
Бот: Показывает детали вакансии 123
*/
// bot/comand.js - УПРОЩЕННЫЙ обработчик callback_query
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data; // 📍 Это данные с кнопки: "vacancy_123", "set_status_456_applied" и т.д.

  try {
    // 1. Если нажали "Подробнее" о вакансии
    if (data.startsWith('vacancy_')) {
      const vacancyId = data.replace('vacancy_', ''); // 📍 Извлекаем ID: из "vacancy_123" получаем "123"
      const mockMsg = {
        ...msg,
        text: `/vacancy ${vacancyId}` //📍 Создаем фейковую команду как будто пользователь написал /vacancy 123
      };
      await vacancyHandlers.handleVacancyCommand(bot, mockMsg, { 
        1: vacancyId // 📍 Передаем ID как параметр команды
      });
    }

    // 2. Если нажали "Изменить статус"
    else if (data.startsWith('show_status_menu_')) {
      const vacancyId = data.replace('show_status_menu_', '');
      await vacancyHandlers.showStatusMenu(bot, chatId, vacancyId, msg.message_id);
    }

    // 3. Если выбрали конкретный статус (например: "set_status_123_applied")
    else if (data.startsWith('set_status_')) {
      const parts = data.split('_'); // 📍 Разбиваем "set_status_123_applied" на части: ["set", "status", "123", "applied"]
      const vacancyId = parts[2]; // 📍 Третья часть - ID вакансии: "123"
      const newStatus = parts[3]; // 📍 Четвертая часть - новый статус: "applied"
      
      await vacancyHandlers.handleStatusChange(bot, chatId, vacancyId, newStatus, msg.message_id);
    }

    // 4. Если нажали "Отмена" - возвращаемся к просмотру вакансии
    else if (data.startsWith('cancel_')) {
      const vacancyId = data.replace('cancel_', '');
      const session = SessionManager.getSession(chatId);
      const vacancy = await VacanciesService.getVacancy(parseInt(vacancyId), session.user.id);
      const message = vacancyHandlers.formatVacancyDetails(vacancy);
       // 📍 Редактируем существующее сообщение (меняем меню статусов на детали вакансии)
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: msg.message_id,
        parse_mode: 'Markdown'
      });
    }


   if (data === 'edit_company') {
    vacancyHandlers.handleFieldSelection(bot, chatId, 'company');
    bot.answerCallbackQuery(callbackQuery.id);
  }
  else if (data === 'edit_jobTitle') {
    vacancyHandlers.handleFieldSelection(bot, chatId, 'jobTitle');
    bot.answerCallbackQuery(callbackQuery.id);
  }
  else if (data === 'edit_salary') {
  vacancyHandlers.handleFieldSelection(bot, chatId, 'salary');
  bot.answerCallbackQuery(callbackQuery.id);
}
else if (data === 'edit_description') {
  vacancyHandlers.handleFieldSelection(bot, chatId, 'description');
  bot.answerCallbackQuery(callbackQuery.id);
}
else if (data === 'edit_sourcePlatform') {
  vacancyHandlers.handleFieldSelection(bot, chatId, 'sourcePlatform');
  bot.answerCallbackQuery(callbackQuery.id);
}
else if (data === 'edit_source_url') {
  vacancyHandlers.handleFieldSelection(bot, chatId, 'source_url');
  bot.answerCallbackQuery(callbackQuery.id);
}
else if (data === 'edit_notes') {
  vacancyHandlers.handleFieldSelection(bot, chatId, 'notes');
  bot.answerCallbackQuery(callbackQuery.id);
}
else if (data.startsWith('edit_')) {
    const vacancyId = data.split('_')[1];
    vacancyHandlers.handleEditVacancy(bot, chatId, vacancyId);
    bot.answerCallbackQuery(callbackQuery.id);
  }



// ✅ Подтверждаем нажатие кнопки (убираем "часики" в Telegram)
    bot.answerCallbackQuery(callbackQuery.id);

  } catch(error) {
    // 🔥 ПРОСТАЯ ОБРАБОТКА ОШИБОК - только самое необходимое
    console.error('Ошибка в callback_query:', error);
    bot.sendMessage(chatId, '❌ Произошла ошибка при обработке действия');
    bot.answerCallbackQuery(callbackQuery.id);
  }
});


console.log('✅ Команды бота зарегистрированы');

