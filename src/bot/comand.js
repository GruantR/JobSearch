//bot/comand.js
/* значт смотри сутулый пес
bot.on (message) - это обработчик текста. 
msg - это объект -который нам присылает телега когда кто-то что-то отправил. Мы з него вытягиваем данные и работаем с ними
const text = msg.text - это то что отправил пользователь, его текст
const chatId = msg.chat.id - он постоянный

Чтобы боту что-то отправить, используем команду bot.sendMessage(chatId, `первый параметр чат куда отпраить, а этот параметр что мы хотим отправить ему`)

*/
const bot = require("./bot");
const authHandlers = require('./handlers/authHandlers');
const userHandlers = require('./handlers/userHandlers');
const SessionManager = require("./services/sessionManager");
const vacancyHandlers = require('./handlers/vacancyHandlers');
const VacanciesService = require('../services/vacanciesService');
const { handleBotError } = require("../bot/utils/errorHandler");
const menuHandlers = require("./handlers/menuHandlers");

bot.setMyCommands([
  { command: '/start', description: "Начальное приветствие" },
  { command: '/login', description: "Вход в систему" },
  { command: '/menu', description: "Главное меню" },
  { command: '/vacancies', description: "Просмотр текущих вакансий" },
  { command: '/game', description: "Рубануть в игрульку под пивко" },
]);

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  let message = `👋 Привет, ${userName}!\n\nЯ бот для управления вакансиями JobSearch.\n\n`;
  await bot.sendPhoto(chatId, 'https://tlgrm.ru/_/stickers/1b5/0ab/1b50abf8-8451-40ca-be37-ffd7aa74ec4d/50.jpg')
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

  await bot.sendMessage(chatId, message);
});

// Обработчик команды /login
bot.onText(/\/login/, (msg) => {
  authHandlers.handleLoginCommand(bot, msg);
});

// Обработчик команды /login
bot.onText(/\/logout/, (msg) => {
  authHandlers.handleLogoutCommand(bot, msg);
});

bot.onText(/^\/me$/, async (msg) => {
  await userHandlers.handleMeAndProfileComand(msg);
});

bot.onText(/\/vacancies/, (msg) => {
  vacancyHandlers.handleVacanciesCommand(msg);
});

bot.onText(/\/vacancy (.+)/, (msg, match) => {
  console.log(match);

  vacancyHandlers.handleVacancyCommand(bot, msg, match);
});

bot.onText(/^\/menu$/, (msg) => {
  const chatId = msg.chat.id;
  if (!SessionManager.isAuthenticated(chatId)) {
    bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
    return;
  }
  menuHandlers.showMainMenu(chatId);
});




// Обработчик команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const isAuthenticated = SessionManager.isAuthenticated(chatId);

  let message = `🤖 **JobSearch Bot - Справка по командам**\n\n`;

  if (isAuthenticated) {
    const session = SessionManager.getSession(chatId);
    message += `✅ **Авторизован как:** ${session.user.email}\n\n`;

    message += `👨‍💼 **Работа с вакансиями:**\n`;
    message += `├ /vacancies - Ваши вакансии\n`;
    message += `├ /me - Профиль\n`;
    message += `└ /logout - Выйти\n\n`;

    message += `🎮 **Развлечения:**\n`;
    message += `├ /game - Мини-игра\n`;
    message += `└ /help - Справка\n`;
  } else {
    message += `🔐 **Для начала работы:**\n`;
    message += `├ /start - Начать работу\n`;
    message += `├ /login - Войти в систему\n`;
    message += `├ /game - Мини-игра\n`;
    message += `└ /help - Справка\n\n`;

    message += `_После авторизации откроются команды для управления вакансиями_`;
  }

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

/////////////////////////////////GAME/////////////////////////////////

async function newGame(chatId) {
  await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, попробуй отгадать!');
  const randomNumber = Math.floor(Math.random() * 10);
  randomGameNumber.chatId = randomNumber
  await bot.sendMessage(chatId, 'Отгадывай', keyboardGame)
};

const keyboardGame = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "1", callback_data: `game_keyboard_1` },
        { text: "2", callback_data: `game_keyboard_2` },
        { text: "3", callback_data: `game_keyboard_3` }
      ],
      [
        { text: "4", callback_data: `game_keyboard_4` },
        { text: "5", callback_data: `game_keyboard_5` },
        { text: "6", callback_data: `game_keyboard_6` }
      ],
      [
        { text: "7", callback_data: `game_keyboard_7` },
        { text: "8", callback_data: `game_keyboard_8` },
        { text: "9", callback_data: `game_keyboard_9` }
      ],
      [{ text: "0", callback_data: `game_keyboard_0` }]
    ]
  }
}

const againGame = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Начать заново", callback_data: '/again' },
      ]
    ]
  }
}

const randomGameNumber = {};


bot.onText(/\/game/, async (msg) => {
  const chatId = msg.chat.id;
  return await newGame(chatId);

})


// 📋 ОБРАБОТКА ОБЫЧНЫХ СООБЩЕНИЙ (не команд)
bot.on('message', async (msg) => {


  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    // 🚫 1. Игнорируем сообщения без текста (фото, стикеры и т.д.)
    if (!text) return;

    // 🚫 2. Игнорируем команды (они обрабатываются в других обработчиках)
    if (text.startsWith('/')) return;

    // Проверяем, находится ли пользователь в процессе логина
    const loginAttempt = SessionManager.getLoginAttempt(chatId);
    if (loginAttempt) {
      try {
        if (loginAttempt.step === 'email') {
          authHandlers.handleEmailInput(bot, msg);
        } else if (loginAttempt.step === 'password') {
          await authHandlers.handlePasswordInput(bot, msg);
        }
        return
      } catch (error) {
        console.error('Ошибка в процессе логина:', error);
        const message = handleBotError(error);
        bot.sendMessage(chatId, `❌ Ошибка при входе: ${message}`);
        return;
      }
    }

    // ПРОВЕРЯЕМ - находится ли пользователь в процессе редактирования
    const session = SessionManager.getSession(chatId);
    if (session && session.editingVacancy && session.editingVacancy.step === 'awaiting_input') {
      await vacancyHandlers.start2EditVacancyField(chatId, text, session)
      return;
    }

    bot.sendMessage(
      chatId,
      '🤔 Я пока понимаю только команды. Напиши /help чтобы узнать что я умею!'
    );

  } catch (error) {
    console.error('Непредвиденная ошибка в обработчике сообщений:', error);
    bot.sendMessage(chatId, '❌ Произошла непредвиденная ошибка. Попробуйте еще раз.');
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
      const parts = data.split('_');
      const vacancyId = parts[1]
      await vacancyHandlers.handleVacancyCommand(chatId, vacancyId)
    }

    // 2. Если нажали "Изменить статус"
    else if (data.startsWith('show_status_menu_')) {
      const vacancyId = data.replace('show_status_menu_', '');
      await vacancyHandlers.showStatusMenu(chatId, vacancyId, msg.message_id);
    }

    // 3. Если выбрали конкретный статус (например: "set_status_123_applied")
    else if (data.startsWith('set_status_')) {
      const parts = data.split('_');
      const vacancyId = parts[2];
      const newStatus = parts[3];
      await vacancyHandlers.handleStatusChange(bot, chatId, vacancyId, newStatus, msg.message_id);
    }


    // все что касаемо редактрования
    if (data.startsWith('editVacancy_')) {
      const vacancyId = data.split('_')[1]
      await vacancyHandlers.handleVacancyCommand(chatId, vacancyId);
      vacancyHandlers.showEditMenu(chatId, vacancyId);
    }


    if (data.startsWith('editDataVacancy_')) {
      const parts = data.split('_');
      const vacancyId = parts[1];
      const editModule = parts[2];
      await vacancyHandlers.startEditVacancyField(chatId, vacancyId, editModule)
      bot.sendMessage(chatId, 'Введите новое значение');
    }

    // Кнопка отмены введения новых данных любого из полей редактрования вакансии - переход меню выбора полей для редактрования
    if (data.startsWith('cancel_editDataVacancy_')) {
      const parts = data.split('_');
      const vacancyId = parts[2];
      await vacancyHandlers.handleVacancyCommand(chatId, vacancyId);
      vacancyHandlers.showEditMenu(chatId, vacancyId);
    }

    // Кнопка отмены выбора полей для редактирования вакансий - переход в подробное описание вакансии
    if (data.startsWith('cancel_editVacancy_')) {
      const parts = data.split('_');
      const vacancyId = parts[2];
      await vacancyHandlers.handleVacancyCommand(chatId, vacancyId)
    }
    // Кнопка - показать все вакансии
    if (data === 'getVacancies') {
      await vacancyHandlers.handleVacanciesCommand(msg)
    }

      if (data === 'menu_profile') {
      await userHandlers.handleMeAndProfileComand(msg)
    }






















    if (data === '/again') {
      await newGame(chatId)
    }

    if (data.startsWith('game_keyboard')) {
      const idKeyboard = Number(data.split('_')[2])
      await bot.sendMessage(chatId, `Ты выбрал кнопку ${idKeyboard}`);
      if (idKeyboard === randomGameNumber.chatId) {
        await bot.sendPhoto(chatId, 'https://cdn27.echosevera.ru/64809353eac9120dd845a103/6484502b61cba.jpg')
        return await bot.sendMessage(chatId, `Ты угадал, ты крут`, againGame);
      }
      else {
        await bot.sendPhoto(chatId, 'https://cs.pikabu.ru/img_n/2012-10_3/53z.jpg')
        return await bot.sendMessage(chatId, `Не угадаль, число правильное ${randomGameNumber.chatId}`, againGame);
      }

    }





    // ✅ Подтверждаем нажатие кнопки (убираем "часики" в Telegram)
    bot.answerCallbackQuery(callbackQuery.id);

  } catch (error) {
    // 🔥 ПРОСТАЯ ОБРАБОТКА ОШИБОК - только самое необходимое
    console.error('Ошибка в callback_query:', error);
    bot.sendMessage(chatId, '❌ Произошла ошибка при обработке действия');
    bot.answerCallbackQuery(callbackQuery.id);
  }
});


console.log('✅ Команды бота зарегистрированы');

