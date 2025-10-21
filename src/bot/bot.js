//bot/bot.js
const TelegramBot = require('node-telegram-bot-api');
const { botToken, webhookUrl } = require('./config');

let bot;

if (process.env.NODE_ENV === 'production' && webhookUrl) {
    // В production используем webhook
    bot = new TelegramBot(botToken);
    bot.setWebHook(`${webhookUrl}/bot${botToken}`);
  } else {
    // В development используем polling (проще для начала)
    bot = new TelegramBot(botToken, { polling: true });
  }
  
  console.log('🤖 Telegram бот инициализирован');
  
  module.exports = bot;