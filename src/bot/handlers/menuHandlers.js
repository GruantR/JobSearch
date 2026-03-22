const bot = require("../bot");

class MenuHandlers {
  async showMainMenu(chatId, additionalText = "") {
    const message = additionalText 
      ? `${additionalText}\n\n🎯 *Главное меню*`
      : "🎯 *Главное меню*";

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "👤 Профиль", callback_data: "menu_profile" },
            { text: "📊 Вакансии", callback_data: "getVacancies" }
          ],
          [
            { text: "🎮 Игра", callback_data: "again_game" },
            { text: "📈 Аналитика", callback_data: "menu_analytics" }
          ],
          [
            { text: "👥 Рекрутеры", callback_data: "menu_recruiters" },
            { text: "🚪 Выход", callback_data: "menu_logout" }
          ]
        ]
      }
    };

    await bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      ...keyboard
    });
  }
}

module.exports = new MenuHandlers();