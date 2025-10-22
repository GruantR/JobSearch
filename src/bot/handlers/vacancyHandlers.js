const VacanciesService = require("../../services/vacanciesService");
const sessionManager = require("../services/sessionManager");
const { handleBotError } = require("../utils/errorHandler");

class VacancyHandlers {
  get statusEmojis() {
    return {
      'found': '🔍 Найдена вакансия',
      'applied': '📤 Откликнулся',
      'waiting': '⏳ В ожидании ответа', 
      'interview': '💼 Собеседование',
      'offer': '🎉 Оффер',
      'rejected': '❌ Отказ',
      'archived': '📁 Архивирована'
    };
  }

  async handleVacanciesCommand(bot, msg) {
    const chatId = msg.chat.id;
    try {
      if (!sessionManager.isAuthenticated(chatId)) {
        bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
        return;
      }
        const session = sessionManager.getSession(chatId);
        const vacancies = await VacanciesService.getVacancies(session.user.id);
        const message = this.formatVacanciesList(vacancies);
         bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });


    } catch (error) {
                    const message = handleBotError(error);
            bot.sendMessage(chatId, message);
    }
  }

    formatVacanciesList(vacancies) {
    if (vacancies.length === 0) {
      return '📭 У вас пока нет вакансий.\n\nИспользуйте веб-приложение чтобы добавить первую вакансию!';
    }

    let message = `📋 **Ваши вакансии (${vacancies.length}):**\n\n`;

    vacancies.forEach((vacancy, index) => {
      const emoji = this.statusEmojis[vacancy.status] || '📄';
      message += `${index + 1}. ${emoji} **${vacancy.jobTitle || 'Без названия'}**\n`;
      message += `   🏢 ${vacancy.companyName || 'Компания не указана'}\n`;
      message += `   💰 ${vacancy.salary || 'З/П не указана'}\n`;
      message += `   🆔 ${vacancy.id}\n\n`;
    });

    message += '💡 Используйте `/vacancy <ID>` для подробной информации';

    return message;
  }
}

module.exports = new VacancyHandlers();
