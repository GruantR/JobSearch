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

         this.sendVacanciesWithDetailedKeyboard(bot, chatId, vacancies);


    } catch (error) {
                    const message = handleBotError(error);
            bot.sendMessage(chatId, message);
    }
  }


sendVacanciesWithDetailedKeyboard(bot, chatId, vacancies) {
  if (vacancies.length === 0) {
    bot.sendMessage(chatId, '📭 У вас пока нет вакансий.');
    return;
  }

  // Отправляем каждую вакансию отдельным сообщением с кнопками
  vacancies.forEach(vacancy => {
    const emoji = this.statusEmojis[vacancy.status] || '📄';
const message = `${emoji} **${vacancy.jobTitle || 'Без названия'}**\n🏢 ${vacancy.companyName}\n💰 ${vacancy.salary || 'З/П не указана'}`

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '📋 Подробнее',
            callback_data: `vacancy_${vacancy.id}`
          },
          {
            text: '🔄 Статус', 
            callback_data: `status_${vacancy.id}`
          }
        ]
      ]
    };

    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  });
}

  

  

    async handleVacancyCommand(bot, msg, match) {
    const chatId = msg.chat.id;
     const vacancyId = match[1];
    try {
      if (!sessionManager.isAuthenticated(chatId)) {
        bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
        return;
      }

        if (!/^\d+$/.test(vacancyId)) {
        bot.sendMessage(chatId, '❌ Неверный формат ID. Используйте: /vacancy <число>');
        return;
      }
        const session = sessionManager.getSession(chatId);
        const vacancy = await VacanciesService.getVacancy(vacancyId, session.user.id);
        const message = this.formatVacancyDetails(vacancy)
        bot.sendMessage(chatId, message)



    } catch (error) {
      const message = handleBotError(error);
      bot.sendMessage(chatId, message);
    }
  }

      formatVacancyDetails(vacancy) {
    const emoji = this.statusEmojis[vacancy.status] || '📄';
    
    let message = `${emoji} **${vacancy.jobTitle || 'Без названия'}**\n\n`;
    
    message += `🏢 **Компания:** ${vacancy.companyName || 'Не указана'}\n`;
    message += `💰 **Зарплата:** ${vacancy.salary || 'Не указана'}\n`;
    message += `📋 **Платформа:** ${vacancy.sourcePlatform || 'Не указана'}\n`;
    message += `🔗 **Ссылка:** ${vacancy.source_url || 'Нет ссылки'}\n\n`;
    
    message += `📝 **Описание:**\n${vacancy.description || 'Нет описания'}\n\n`;
    
    message += `📅 **Дата подачи:** ${vacancy.applicationDate ? new Date(vacancy.applicationDate).toLocaleDateString('ru-RU') : 'Не указана'}\n`;
    message += `📝 **Заметки:** ${vacancy.notes || 'Нет заметок'}\n\n`;
    
    message += `🆔 **ID:** ${vacancy.id}\n`;
    message += `📅 **Создана:** ${new Date(vacancy.createdAt).toLocaleDateString('ru-RU')}\n`;
    message += `🔄 **Обновлена:** ${new Date(vacancy.updatedAt).toLocaleDateString('ru-RU')}`;

    return message;

  }

  


  
}

module.exports = new VacancyHandlers();
