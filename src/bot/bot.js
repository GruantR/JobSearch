//bot/bot.js
const TelegramBot = require("node-telegram-bot-api");
const logger = require("../utils/logger");
const { botToken, webhookUrl } = require("./config");

let bot;

function shouldRunBot() {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  if (process.env.ENABLE_BOT === "false") {
    logger.info("🚫 Бот отключён в продакшене (ENABLE_BOT=false)");
    return false;
  }
  return true;
}

if (shouldRunBot()) {
  if (!botToken) {
    logger.error("❌ TELEGRAM_BOT_TOKEN не установлен. Бот не будет запущен.");
    bot = null;
  } else {
    try {
      if (process.env.NODE_ENV === "production" && webhookUrl) {
        bot = new TelegramBot(botToken, { polling: false });
        const hook = `${webhookUrl}/bot${botToken}`;
        bot.setWebHook(hook).catch((err) => {
          logger.error("❌ setWebHook:", err.message || err);
        });
        logger.info("🤖 Бот в production: webhook →", hook.replace(botToken, "<token>"));
      } else if (process.env.NODE_ENV === "production" && !webhookUrl) {
        logger.warn(
          "⚠️ Не задан PUBLIC_URL / RENDER_EXTERNAL_URL / WEBHOOK_BASE_URL — для Render задайте URL сервиса. Временно используется polling."
        );
        bot = new TelegramBot(botToken, { polling: true });
      } else {
        bot = new TelegramBot(botToken, { polling: true });
        logger.info("🤖 Бот в development: polling");
      }
    } catch (error) {
      logger.error("❌ Ошибка при создании бота:", error.message);
      bot = null;
    }
  }
} else {
  bot = null;
  logger.info("⏸️  Бот не запущен");
}

module.exports = bot;
