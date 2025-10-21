//bot/comand.js
const bot = require("./bot");
const SessionManager = require("./services/sessionManager");

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  
console.log(msg);

  bot.sendMessage(
    chatId,
    `👋 Привет, ${userName}!\n\nЯ бот для управления вакансиями JobSearch.\n\nДоступные команды:\n/help - справка\n\nНачни с /help чтобы узнать больше!`
   
    
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
    `🚀 _Развиваем бота дальше..._`,
    { parse_mode: 'Markdown' }
  );
});




