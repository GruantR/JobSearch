//bot/bot.js
const TelegramBot = require('node-telegram-bot-api');
const { botToken, webhookUrl } = require('./config');

let bot;

// Проверяем, запускать ли бота в текущем окружении
const shouldRunBot = () => {
  // Если в режиме разработки - всегда запускаем
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  // Если в продакшне - проверяем флаг
  // Можно использовать переменную окружения
  if (process.env.ENABLE_BOT === 'false') {
    console.log('🚫 Бот отключен в продакшне (ENABLE_BOT=false)');
    return false;
  }
  
  // По умолчанию в продакшне не запускаем, пока не настроены сессии
  console.log('⚠️  Бот в продакшне отключен. Настройте сессии через Sequelize');
  return false;
};




if (shouldRunBot()) {
  if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN не установлен. Бот не будет запущен.');
    bot = null;
  } else {
    try {
      if (process.env.NODE_ENV === 'production' && webhookUrl) {
        // В production используем webhook
        bot = new TelegramBot(botToken);
        bot.setWebHook(`${webhookUrl}/bot${botToken}`);
        console.log('🤖 Бот запущен в production с webhook');
      } else {
        // В development используем polling
        bot = new TelegramBot(botToken, { polling: true });
        console.log('🤖 Бот запущен в development с polling');
      }
    } catch (error) {
      console.error('❌ Ошибка при создании бота:', error.message);
      bot = null;
    }
  }
} else {
  // Создаем заглушку для экспорта
  bot = null;
  console.log('⏸️  Бот не запущен');
}
  
  module.exports = bot;