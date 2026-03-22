// src/bot/handlers/vacancyHandlers.js
const VacanciesService = require("../../services/vacanciesService");
const sessionManager = require("../services/sessionManager");
const bot = require("../bot");
const { handleBotError } = require("../utils/errorHandler");

class VacancyHandlers {
  get statusEmojis() {
    return {
      found: "🔍 Найдена вакансия",
      applied: "📤 Откликнулся",
      viewed: "👀 Просмотрена",
      noResponse: "⏳ Нет ответа",
      invited: "💼 Приглашение / интервью",
      offer: "🎉 Оффер",
      rejected: "❌ Отказ",
      archived: "📁 Архивирована",
    };
  }

  async handleVacanciesCommand(msg) {
    const chatId = msg.chat.id;
    try {
      if (!(await sessionManager.isAuthenticated(chatId))) {
        await bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
        return;
      }

      const session = await sessionManager.getSession(chatId);
      const vacancies = await VacanciesService.getVacancies(session.user.id);

      if (vacancies.length === 0) {
        await bot.sendMessage(chatId, "📭 У вас пока нет вакансий.");
        return;
      }

      // Используем for...of вместо forEach для корректной работы с async
      for (const vacancy of vacancies) {
        const emoji = this.statusEmojis[vacancy.status] || "📄";
        const message = `${emoji} **${vacancy.jobTitle || "Без названия"}**\n🏢 ${vacancy.companyName}\n💰 ${vacancy.salary || "З/П не указана"}`;

        const keyboard = {
          inline_keyboard: [
            [
              { text: "📋 Подробнее", callback_data: `vacancy_${vacancy.id}` },
              { text: "✏️ Редактировать", callback_data: `editVacancy_${vacancy.id}` },
              { text: "🔄 Статус", callback_data: `show_status_menu_${vacancy.id}` },
            ],
          ],
        };

        await bot.sendMessage(chatId, message, {
          reply_markup: keyboard,
        });
      }
    } catch (error) {
      await bot.sendMessage(chatId, handleBotError(error));
    }
  }

  async showStatusMenu(chatId, vacancyId, messageId) {
    try {
      if (!(await sessionManager.isAuthenticated(chatId))) {
        await bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
        return;
      }

      const session = await sessionManager.getSession(chatId);
      const vacancy = await VacanciesService.getVacancy(parseInt(vacancyId), session.user.id);

      const message = `📋 **Выберите новый статус для вакансии:**\n\n"${vacancy.jobTitle}"\n\nТекущий статус: ${this.statusEmojis[vacancy.status]}`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: "🔍 Найдена", callback_data: `set_status_${vacancyId}_found` },
            { text: "📤 Откликнулся", callback_data: `set_status_${vacancyId}_applied` },
          ],
          [
            { text: "👀 Просмотрена", callback_data: `set_status_${vacancyId}_viewed` },
            { text: "⏳ Нет ответа", callback_data: `set_status_${vacancyId}_noResponse` },
          ],
          [
            { text: "💼 Приглашение", callback_data: `set_status_${vacancyId}_invited` },
            { text: "🎉 Оффер", callback_data: `set_status_${vacancyId}_offer` },
          ],
          [
            { text: "❌ Отказ", callback_data: `set_status_${vacancyId}_rejected` },
            { text: "📁 Архив", callback_data: `set_status_${vacancyId}_archived` },
            { text: "❌ Отмена", callback_data: `cancel_editVacancy_${vacancyId}` },
          ],
        ],
      };

      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      await bot.sendMessage(chatId, handleBotError(error));
    }
  }

  async handleStatusChange(bot, chatId, vacancyId, newStatus, messageId) {
    try {
      if (!(await sessionManager.isAuthenticated(chatId))) {
        await bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
        return;
      }

      const session = await sessionManager.getSession(chatId);
      await VacanciesService.updateVacancyStatus(parseInt(vacancyId), session.user.id, newStatus);

      const successMessage = `✅ Статус обновлен: ${this.statusEmojis[newStatus]}`;
      await bot.sendMessage(chatId, successMessage);
      await this.handleVacancyCommand(chatId, vacancyId);
    } catch (error) {
      await bot.sendMessage(chatId, handleBotError(error));
    }
  }

  async handleVacancyCommand(chatId, vacancyId) {
    try {
      if (!(await sessionManager.isAuthenticated(chatId))) {
        await bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
        return;
      }

      if (!/^\d+$/.test(vacancyId)) {
        await bot.sendMessage(chatId, "❌ Неверный формат ID. Используйте: /vacancy <число>");
        return;
      }

      const session = await sessionManager.getSession(chatId);
      const vacancy = await VacanciesService.getVacancy(vacancyId, session.user.id);

      const message = this.formatVacancyDetails(vacancy);
      const keyboard = {
        inline_keyboard: [
          [
            { text: "Редактировать данные", callback_data: `editVacancy_${vacancy.id}` },
            { text: "Изменить статус вакансии", callback_data: `show_status_menu_${vacancy.id}` }
          ],
          [
            { text: "Назад к списку вакансий", callback_data: `getVacancies` },
          ],
        ],
      };
      
      await bot.sendMessage(chatId, message, {
        reply_markup: keyboard,
      });
    } catch (error) {
      await bot.sendMessage(chatId, handleBotError(error));
    }
  }

  async showEditMenu(chatId, vacancyId) {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🏢 Компания", callback_data: `editDataVacancy_${vacancyId}_companyName` },
            { text: "💼 Должность", callback_data: `editDataVacancy_${vacancyId}_jobTitle` },
          ],
          [
            { text: "💰 Зарплата", callback_data: `editDataVacancy_${vacancyId}_salary` },
            { text: "📝 Описание", callback_data: `editDataVacancy_${vacancyId}_description` },
          ],
          [
            { text: "🌐 Платформа", callback_data: `editDataVacancy_${vacancyId}_sourcePlatform` },
            { text: "🔗 Ссылка", callback_data: `editDataVacancy_${vacancyId}_sourceUrl` },
          ],
          [
            { text: "📋 Заметки", callback_data: `editDataVacancy_${vacancyId}_notes` },
            { text: "❌ Отмена", callback_data: `cancel_editVacancy_${vacancyId}` },
          ],
        ],
      },
    };

    await bot.sendMessage(chatId, "Что хотите изменить?", keyboard);
  }

  async startEditVacancyField(chatId, vacancyId, editModule) {
    const session = await sessionManager.getSession(chatId);
    sessionManager.startEditingVacancy(chatId, {
      vacancyId: vacancyId,
      field: editModule,
      step: "awaiting_input",
    });

    const vacancy = await VacanciesService.getVacancy(vacancyId, session.user.id);
    const keyboard = {
      inline_keyboard: [
        [
          { text: "❌ Отменить редактирование", callback_data: `cancel_editDataVacancy_${vacancyId}` },
        ],
      ],
    };

    await bot.sendMessage(chatId, `Текущее значение: ${vacancy[editModule] || "не указано"}`, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  }

  async start2EditVacancyField(chatId, newValue, session) {
    try {
      const editingVacancy = sessionManager.getEditingVacancy(chatId);
      if (!editingVacancy) {
        await bot.sendMessage(chatId, "❌ Процесс редактирования не найден");
        return;
      }
      
      const { vacancyId, field } = editingVacancy;
      const updateData = { [field]: newValue };
      
      await VacanciesService.patchVacancyData(parseInt(vacancyId), session.user.id, updateData);
      
      sessionManager.clearEditingVacancy(chatId);
      await bot.sendMessage(chatId, "✅ Изменения сохранены!");
      await this.showEditMenu(chatId, vacancyId);
    } catch (error) {
      await bot.sendMessage(chatId, handleBotError(error));
    }
  }

  formatVacancyDetails(vacancy) {
    const emoji = this.statusEmojis[vacancy.status] || "📄";
    let message = `${emoji} **${vacancy.jobTitle || "Без названия"}**\n\n`;

    message += `🏢 **Компания:** ${vacancy.companyName || "Не указана"}\n`;
    message += `💰 **Зарплата:** ${vacancy.salary || "Не указана"}\n`;
    message += `📋 **Платформа:** ${vacancy.sourcePlatform || "Не указана"}\n`;
    message += `🔗 **Ссылка:** ${vacancy.sourceUrl || "Нет ссылки"}\n\n`;
    message += `📝 **Описание:**\n${vacancy.description || "Нет описания"}\n\n`;
    message += `📅 **Дата подачи:** ${vacancy.applicationDate ? new Date(vacancy.applicationDate).toLocaleDateString("ru-RU") : "Не указана"}\n`;
    message += `📝 **Заметки:** ${vacancy.notes || "Нет заметок"}\n\n`;
    message += `🆔 **ID:** ${vacancy.id}\n`;
    message += `📅 **Создана:** ${new Date(vacancy.createdAt).toLocaleDateString("ru-RU")}\n`;
    message += `🔄 **Обновлена:** ${new Date(vacancy.updatedAt).toLocaleDateString("ru-RU")}`;

    return message;
  }
}

module.exports = new VacancyHandlers();