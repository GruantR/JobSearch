const logger = require("../utils/logger");

/**
 * Регистрирует POST-маршрут для Telegram webhook (production).
 * Должен вызываться после загрузки bot/comand, до app.listen.
 */
function attachTelegramWebhook(app, bot) {
  if (!bot || process.env.NODE_ENV !== "production") {
    return;
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return;
  }

  app.post(`/bot${token}`, (req, res) => {
    try {
      bot.processUpdate(req.body);
    } catch (e) {
      logger.error("Telegram webhook processUpdate:", e);
    }
    res.sendStatus(200);
  });
  logger.warn("✅ Зарегистрирован приёмник Telegram webhook (POST /bot<token>)");
}

module.exports = { attachTelegramWebhook };
