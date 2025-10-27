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
            { text: "✏️ Редактировать", callback_data: `edit_${vacancy.id}` },
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

showEditMenu(bot, chatId, vacancyId) {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🏢 Компания", callback_data: `edit_company` },
          { text: "💼 Должность", callback_data: `edit_jobTitle` }
        ],
        [
          { text: "💰 Зарплата", callback_data: `edit_salary` },
          { text: "📝 Описание", callback_data: `edit_description` }
        ],
        [
          { text: "🌐 Платформа", callback_data: `edit_sourcePlatform` },
          { text: "🔗 Ссылка", callback_data: `edit_source_url` }
        ],
        [
          { text: "📋 Заметки", callback_data: `edit_notes` },
          { text: "❌ Отмена", callback_data: `cancel_edit_${vacancyId}` }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, "Что хотите изменить?", keyboard);
}

// Обработчик открытия меню редактирования
 handleEditVacancy(bot, chatId, vacancyId) {
  // Сохраняем в сессии vacancyId и состояние
  const session = sessionManager.getSession(chatId);
  session.editingVacancy = {
    vacancyId: vacancyId,
    step: 'menu' // этап - показ меню
  };
  
  this.showEditMenu(bot, chatId, vacancyId);
}

// Обработчик выбора поля для редактирования
async handleFieldSelection(bot, chatId, field) {
try {
    const session = sessionManager.getSession(chatId);
    
    if (session.editingVacancy) {
      // Получаем текущие данные вакансии
      const vacancy = await VacanciesService.getVacancy(
        session.editingVacancy.vacancyId, 
        session.user.id
      );
      
      // Получаем текущее значение поля
       const currentValues = {
        company: vacancy.companyName,
        jobTitle: vacancy.jobTitle,
        salary: vacancy.salary,
        description: vacancy.description,
        sourcePlatform: vacancy.sourcePlatform,
        source_url: vacancy.source_url,
        notes: vacancy.notes
      };

      const currentValue = currentValues[field] || 'не указано';
      
      // Обновляем состояние - пользователь выбрал поле
      session.editingVacancy.field = field;
      session.editingVacancy.step = 'awaiting_input';
      
      // Запрашиваем новое значение, показывая текущее
        const fieldNames = {
        company: 'название компании',
        jobTitle: 'должность',
        salary: 'зарплату',
        description: 'описание',
        sourcePlatform: 'платформу',
        source_url: 'ссылку',
        notes: 'заметки'
      };
      
      const message = `📝 Редактирование ${fieldNames[field]}\n\n` +
                     `Текущее значение: *${currentValue}*\n\n` +
                     `Введите новое ${fieldNames[field]}:`;
      
      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    const message = handleBotError(error);
    bot.sendMessage(chatId, `❌ Ошибка: ${message}`);
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