// src/bot/handlers/menuHandlers.js
const bot = require("../bot");
const sessionManager = require("../services/sessionManager");

class MenuHandlers {
  showMainMenu(chatId, additionalText = "") {
    const message = additionalText 
      ? `${additionalText}\n\n🎯 *Главное меню*`
      : "🎯 *Главное меню*";

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "👤 Профиль", callback_data: "menu_profile" },
            { text: "📊 Вакансии", callback_data: "menu_vacancies" }
          ],
          [
            { text: "🎮 Игра", callback_data: "menu_game" },
            { text: "📈 Аналитика", callback_data: "menu_analytics" }
          ],
          [
            { text: "👥 Рекрутеры", callback_data: "menu_recruiters" },
            { text: "🚪 Выход", callback_data: "menu_logout" }
          ]
        ]
      }
    };

    bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      ...keyboard
    });
  }

  // Обработчики для каждой кнопки меню (пока заглушки)
  handleMenuProfile(chatId) {
    // Будет перенаправлять на команду /me
    bot.sendMessage(chatId, "📋 Загружаю информацию о профиле...");
    // Здесь можно вызвать существующий обработчик профиля
  }

  handleMenuVacancies(chatId) {
    // Будет перенаправлять на команду /vacancies
    bot.sendMessage(chatId, "📊 Загружаю список вакансий...");
  }

  handleMenuGame(chatId) {
    // Будет перенаправлять на команду /game
    bot.sendMessage(chatId, "🎮 Запускаю игру...");
  }

  handleMenuAnalytics(chatId) {
    bot.sendMessage(chatId, "📈 *Аналитика*\n\nРаздел в разработке 🚧", {
      parse_mode: "Markdown"
    });
  }

  handleMenuRecruiters(chatId) {
    bot.sendMessage(chatId, "👥 *Рекрутеры*\n\nРаздел в разработке 🚧", {
      parse_mode: "Markdown"
    });
  }

  handleMenuLogout(chatId) {
    bot.sendMessage(chatId, "🚪 Выход из системы...");
    // Здесь можно вызвать существующий обработчик выхода
  }
}

module.exports = new MenuHandlers();