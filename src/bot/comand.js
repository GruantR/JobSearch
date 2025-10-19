const bot = require("./bot");
const VacancyService = require("./services/vacancyService");

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;

  bot.sendMessage(
    chatId,
    `👋 Привет, ${userName}!\n\nЯ бот для управления вакансиями JobSearch.\n\nДоступные команды:\n/help - справка\n/vacancies - список вакансий\n\nНачни с /help чтобы узнать больше!`
  );
});

// Обработчик команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `📚 **Доступные команды:**\n\n` +
      `/start - начать работу\n` +
      `/help - эта справка\n` +
      `/vacancies - показать все вакансии\n` +
      `/vacancy <ID> - подробности конкретной вакансии\n\n` +
      `**Примеры:**\n` +
      `/vacancies - покажет список вакансий\n` +
      `/vacancy 1 - покажет вакансию с ID=1\n\n` +
      `🚀 _Скоро будет больше функций..._`,
    { parse_mode: "Markdown" }
  );
});

// Обработчик команды /vacancies
bot.onText(/\/vacancies/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await bot.sendChatAction(chatId, "typing");

    const vacancies = await VacancyService.getAllVacancies(5); // Берем 5 последних

    const message = VacancyService.formatVacanciesList(vacancies);

    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("❌ Ошибка при получении вакансий:", error);
    bot.sendMessage(
      chatId,
      "❌ Произошла ошибка при получении вакансий. Попробуйте позже."
    );
  }
});

// Обработчик команды /vacancy с параметром ID
bot.onText(/\/vacancy (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const vacancyId = match[1]; // Получаем ID из регулярного выражения
  
    // Проверяем что ID - число
    if (!/^\d+$/.test(vacancyId)) {
      bot.sendMessage(chatId, '❌ Неверный формат ID. Используйте: /vacancy <число>');
      return;
    }
  
    try {
      await bot.sendChatAction(chatId, 'typing');
      
      const vacancy = await VacancyService.getVacancyById(parseInt(vacancyId));
      
      if (!vacancy) {
        bot.sendMessage(chatId, `❌ Вакансия с ID ${vacancyId} не найдена.`);
        return;
      }
  
      const message = VacancyService.formatVacancyForTelegram(vacancy);
      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('❌ Ошибка при получении вакансии:', error);
      bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
    }
  });

// Обработчик обычных сообщений
// Обработчик ВСЕХ сообщений (команд и обычных сообщений)
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Игнорируем служебные сообщения (например, обновление чата)
  if (!text) return;

  // Если это команда (начинается с /)
  if (text.startsWith("/")) {
    // Проверяем, известная ли это команда
    const knownCommands = ["/start", "/help", "/vacancies"];
    const isKnownCommand = knownCommands.some((cmd) => text.startsWith(cmd));

    if (!isKnownCommand) {
      // Неизвестная команда
      bot.sendMessage(
        chatId,
        `❌ Неизвестная команда: "${text}"\n\n` +
          `📝 Доступные команды:\n` +
          `/start - начать работу\n` +
          `/help - справка\n` +
          `/vacancies - список вакансий\n\n` +
          `Напиши /help для подробной информации.`
      );
    }
    // Если команда известная - её обработают другие обработчики
  } else {
    // Обычное сообщение (не команда)
    bot.sendMessage(
      chatId,
      "🤔 Я пока понимаю только команды. Напиши /help чтобы узнать что я умею!"
    );
  }
});

console.log("✅ Обработчики команд бота зарегистрированы");
