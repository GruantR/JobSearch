//bot/bot.js
const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');
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
    logger.info('🚫 Бот отключен в продакшне (ENABLE_BOT=false)');
    return false;
  }
  
  // По умолчанию в продакшне не запускаем, пока не настроены сессии
  logger.info('⚠️  Бот в продакшне отключен. Настройте сессии через Sequelize');
  return false;
};




if (shouldRunBot()) {
  if (!botToken) {
    logger.error('❌ TELEGRAM_BOT_TOKEN не установлен. Бот не будет запущен.');
    bot = null;
  } else {
    try {
      if (process.env.NODE_ENV === 'production' && webhookUrl) {
        // В production используем webhook
        bot = new TelegramBot(botToken);
        bot.setWebHook(`${webhookUrl}/bot${botToken}`);
        logger.info('🤖 Бот запущен в production с webhook');
      } else {
        // В development используем polling
        bot = new TelegramBot(botToken, { polling: true });
        logger.info('🤖 Бот запущен в development с polling');
      }
    } catch (error) {
      logger.error('❌ Ошибка при создании бота:', error.message);
      bot = null;
    }
  }
} else {
  // Создаем заглушку для экспорта
  bot = null;
  logger.info('⏸️  Бот не запущен');
}
  
  module.exports = bot;