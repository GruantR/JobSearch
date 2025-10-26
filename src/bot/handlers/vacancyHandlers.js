// src/bot/handlers/vacancyHandlers.js
const VacanciesService = require("../../services/vacanciesService");
const sessionManager = require("../services/sessionManager");
const { handleBotError } = require("../utils/errorHandler");

class VacancyHandlers {
  // 📊 Эмодзи для статусов - просто справочник
  get statusEmojis() {
    return {
      found: "🔍 Найдена вакансия",
      applied: "📤 Откликнулся",
      waiting: "⏳ В ожидании ответа",
      interview: "💼 Собеседование",
      offer: "🎉 Оффер",
      rejected: "❌ Отказ",
      archived: "📁 Архивирована",
    };
  }

  // 📋 КОМАНДА /vacancies - показать все вакансии пользователя
  async handleVacanciesCommand(bot, msg) {
    const chatId = msg.chat.id;
    try {
      // 1. Проверяем авторизацию
      if (!sessionManager.isAuthenticated(chatId)) {
        bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
        return;
      }

      // 2. Получаем вакансии из базы
      const session = sessionManager.getSession(chatId);
      const vacancies = await VacanciesService.getVacancies(session.user.id);
      
      // 3. Показываем вакансии с кнопками
      this.sendVacanciesWithDetailedKeyboard(bot, chatId, vacancies);
    } catch (error) {
      // 4. Обрабатываем ошибку
      const message = handleBotError(error);
      bot.sendMessage(chatId, message);
    }
  }

  // 🎯 ПОКАЗАТЬ ВАКАНСИИ С КНОПКАМИ
  sendVacanciesWithDetailedKeyboard(bot, chatId, vacancies) {
    if (vacancies.length === 0) {
      bot.sendMessage(chatId, "📭 У вас пока нет вакансий.");
      return;
    }

    // Для каждой вакансии создаем отдельное сообщение с кнопками
    vacancies.forEach((vacancy) => {
      const emoji = this.statusEmojis[vacancy.status] || "📄";
      const message = `${emoji} **${vacancy.jobTitle || "Без названия"}**\n🏢 ${vacancy.companyName}\n💰 ${vacancy.salary || "З/П не указана"}`;

      // Создаем кнопки для вакансии
      const keyboard = {
        inline_keyboard: [
          [
            { text: "📋 Подробнее", callback_data: `vacancy_${vacancy.id}` },
            { text: "🔄 Статус", callback_data: `show_status_menu_${vacancy.id}` },
          ],
        ],
      };

      // Отправляем сообщение с кнопками
      bot.sendMessage(chatId, message, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    });
  }

  // 🎯 ПОКАЗАТЬ МЕНЮ ВЫБОРА СТАТУСА
  async showStatusMenu(bot, chatId, vacancyId, messageId) {
    try {
      // 1. Проверяем авторизацию
      if (!sessionManager.isAuthenticated(chatId)) {
        bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
        return;
      }

      // 2. Получаем данные вакансии
      const session = sessionManager.getSession(chatId);
      const vacancy = await VacanciesService.getVacancy(parseInt(vacancyId), session.user.id);

      // 3. Формируем сообщение с меню
      const message = `📋 **Выберите новый статус для вакансии:**\n\n"${vacancy.jobTitle}"\n\nТекущий статус: ${this.statusEmojis[vacancy.status]}`;

      // 4. Создаем кнопки статусов
      const keyboard = {
        inline_keyboard: [
          [
            { text: "🔍 Найдена", callback_data: `set_status_${vacancyId}_found` },
            { text: "📤 Откликнулся", callback_data: `set_status_${vacancyId}_applied` },
          ],
          [
            { text: "⏳ В ожидании", callback_data: `set_status_${vacancyId}_waiting` },
            { text: "💼 Собеседование", callback_data: `set_status_${vacancyId}_interview` },
          ],
          [
            { text: "🎉 Оффер", callback_data: `set_status_${vacancyId}_offer` },
            { text: "❌ Отказ", callback_data: `set_status_${vacancyId}_rejected` },
          ],
          [
            { text: "📁 Архив", callback_data: `set_status_${vacancyId}_archived` },
            { text: "❌ Отмена", callback_data: `cancel_${vacancyId}` },
          ],
        ],
      };

      // 5. Показываем меню (редактируем текущее сообщение)
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      const message = handleBotError(error);
      bot.sendMessage(chatId, message);
    }
  }

  // 🎯 ОБРАБОТКА СМЕНЫ СТАТУСА (УПРОЩЕННАЯ ВЕРСИЯ)
  async handleStatusChange(bot, chatId, vacancyId, newStatus, messageId) {
    try {
      // 1. Проверяем авторизацию
      if (!sessionManager.isAuthenticated(chatId)) {
        bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
        return;
      }

      // 2. Получаем сессию пользователя
      const session = sessionManager.getSession(chatId);

      // 3. Пытаемся обновить статус через API
      // 📍 Здесь может произойти ошибка если статус нельзя поменять!
      await VacanciesService.updateVacancyStatus(parseInt(vacancyId), session.user.id, newStatus);

      // 4. Если дошли сюда - значит успешно обновили статус в базе!
      const updatedVacancy = await VacanciesService.getVacancy(parseInt(vacancyId), session.user.id);

      // 5. Показываем успех
      const successMessage = `✅ Статус обновлен: ${this.statusEmojis[newStatus]}`;
      const message = this.formatVacancyDetails(updatedVacancy);

       // 📍 Меняем сообщение с меню статусов на детали вакансии
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
      });

       // 📍 Отправляем отдельное сообщение об успехе
      bot.sendMessage(chatId, successMessage);

    } catch (error) {
        // 🔥 ЕСЛИ ОШИБКА: просто показываем сообщение об ошибке
     // 📍 НЕ пытаемся показывать меню снова - это вызывает проблемы с Telegram API
      const message = handleBotError(error);
      bot.sendMessage(chatId, message);
    }
  }

  // 📋 КОМАНДА /vacancy <id> - показать детали вакансии
  async handleVacancyCommand(bot, msg, match) {
    const chatId = msg.chat.id;
    const vacancyId = match[1];
    
    try {
      // 1. Проверяем авторизацию
      if (!sessionManager.isAuthenticated(chatId)) {
        bot.sendMessage(chatId, "❌ Сначала войдите в систему через /login");
        return;
      }

      // 2. Проверяем что ID вакансии - число
      if (!/^\d+$/.test(vacancyId)) {
        bot.sendMessage(chatId, "❌ Неверный формат ID. Используйте: /vacancy <число>");
        return;
      }

      // 3. Получаем вакансию из базы
      const session = sessionManager.getSession(chatId);
      const vacancy = await VacanciesService.getVacancy(vacancyId, session.user.id);
      
      // 4. Форматируем и показываем детали
      const message = this.formatVacancyDetails(vacancy);
      bot.sendMessage(chatId, message);
    } catch (error) {
      const message = handleBotError(error);
      bot.sendMessage(chatId, message);
    }
  }

  // 🎯 ФОРМАТИРОВАНИЕ ДЕТАЛЕЙ ВАКАНСИИ
  formatVacancyDetails(vacancy) {
    const emoji = this.statusEmojis[vacancy.status] || "📄";

    let message = `${emoji} **${vacancy.jobTitle || "Без названия"}**\n\n`;

    // Основная информация
    message += `🏢 **Компания:** ${vacancy.companyName || "Не указана"}\n`;
    message += `💰 **Зарплата:** ${vacancy.salary || "Не указана"}\n`;
    message += `📋 **Платформа:** ${vacancy.sourcePlatform || "Не указана"}\n`;
    message += `🔗 **Ссылка:** ${vacancy.source_url || "Нет ссылки"}\n\n`;

    // Описание и заметки
    message += `📝 **Описание:**\n${vacancy.description || "Нет описания"}\n\n`;
    message += `📅 **Дата подачи:** ${vacancy.applicationDate ? new Date(vacancy.applicationDate).toLocaleDateString("ru-RU") : "Не указана"}\n`;
    message += `📝 **Заметки:** ${vacancy.notes || "Нет заметок"}\n\n`;

    // Техническая информация
    message += `🆔 **ID:** ${vacancy.id}\n`;
    message += `📅 **Создана:** ${new Date(vacancy.createdAt).toLocaleDateString("ru-RU")}\n`;
    message += `🔄 **Обновлена:** ${new Date(vacancy.updatedAt).toLocaleDateString("ru-RU")}`;

    return message;
  }
}

module.exports = new VacancyHandlers();