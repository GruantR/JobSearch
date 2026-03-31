//src/bot/services/sessionManager.js
const logger = require("../../utils/logger");
const { models } = require("../../models");
const { Session, User } = models;

class SessionManager {
  constructor() {
    // Создаём хранилище для попыток входа (ключ: chatId, значение: процесс логина)
    // Это временные данные процесса логина, не храним в БД
    this.loginAttempts = new Map();
    // Создаём хранилище для процесса редактирования вакансий (ключ: chatId, значение: данные редактирования)
    // Это временные данные процесса редактирования, не храним в БД
    this.editingVacancies = new Map();
  }

  // Создание сессии - "заселяем пользователя в номер"
  async createSession(chatId, userData) {
    try {
      // Проверяем, существует ли уже сессия для этого chatId
      const existingSession = await Session.findByPk(String(chatId));
      
      if (existingSession) {
        // Обновляем существующую сессию
        existingSession.userId = userData.id;
        existingSession.lastActivity = new Date();
        await existingSession.save();
        
        return {
          user: userData,
          createdAt: existingSession.createdAt,
          lastActivity: existingSession.lastActivity
        };
      } else {
        // Создаём новую сессию в БД
        const session = await Session.create({
          chatId: String(chatId),
          userId: userData.id,
          lastActivity: new Date()
        });
        
        return {
          user: userData,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity
        };
      }
    } catch (error) {
      logger.error("Ошибка при создании сессии:", error);
      throw error;
    }
  }

  // Получение сессии - "проверяем кто в номере"
  async getSession(chatId) {
    try {
      // Ищем сессию в БД с загрузкой данных пользователя
      const session = await Session.findByPk(String(chatId), {
        include: [{
          model: User,
          attributes: ['id', 'email']
        }]
      });
      
      if (!session) {
        return undefined;
      }
      
      // Обновляем время последней активности
      session.lastActivity = new Date();
      await session.save();
      
      // Возвращаем сессию в формате, совместимом со старым API
      return {
        user: {
          id: session.User.id,
          email: session.User.email
        },
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      };
    } catch (error) {
      logger.error("Ошибка при получении сессии:", error);
      return undefined;
    }
  }

  // Удаление сессии - "выселяем пользователя из номера"
  async deleteSession(chatId) {
    try {
      await Session.destroy({
        where: { chatId: String(chatId) }
      });
    } catch (error) {
      logger.error("Ошибка при удалении сессии:", error);
      throw error;
    }
  }

  // Проверка аутентификации - "проверяем заселен ли пользователь"
  async isAuthenticated(chatId) {
    try {
      const session = await Session.findByPk(String(chatId));
      return !!session;
    } catch (error) {
      logger.error("Ошибка при проверке аутентификации:", error);
      return false;
    }
  }

  // Начало процесса логина - "пользователь подошёл к стойке регистрации"
  startLoginAttempt(chatId) {
    // Создаём запись о попытке входа
    this.loginAttempts.set(chatId, {
      step: 'email',        // Первый шаг - запросим email
      attempts: 0,          // Счётчик неудачных попыток
      createdAt: new Date() // Когда начался процесс логина
    });
    // ⚠️ НЕТ return - просто инициализируем процесс
  }

  // Сохранение email в процессе логина - "пользователь назвал своё имя"
  setLoginEmail(chatId, email) {
    // Достаём попытку входа из хранилища
    const attempt = this.loginAttempts.get(chatId);
    // Если попытка существует - сохраняем email и переходим к следующему шагу
    if (attempt) {
      attempt.email = email;           // Сохраняем email
      attempt.step = 'password';       // Меняем шаг на "ввод пароля"
    }
    // ⚠️ НЕТ return - просто обновляем состояние
  }

  // Получение данных о попытке входа - "смотрим карточку регистрации"
  getLoginAttempt(chatId) {
    // ⚠️ ИСПРАВЬ: нужно вернуть значение!
    const attempt = this.loginAttempts.get(chatId);
    return attempt; // ← ДОБАВЬ ЭТУ СТРОКУ!
  }

  // Очистка попытки входа - "убираем карточку регистрации" 
  // эта штука нужна когда ввел логин и пароль

  clearLoginAttempt(chatId) {
    // Удаляем попытку входа из хранилища
    this.loginAttempts.delete(chatId);
    // ⚠️ НЕТ return - просто очищаем
  }

  // Начало процесса редактирования вакансии
  startEditingVacancy(chatId, editingData) {
    this.editingVacancies.set(chatId, editingData);
  }

  // Получение данных о процессе редактирования вакансии
  getEditingVacancy(chatId) {
    return this.editingVacancies.get(chatId);
  }

  // Очистка процесса редактирования вакансии
  clearEditingVacancy(chatId) {
    this.editingVacancies.delete(chatId);
  }
}

// Создаём единственный экземпляр SessionManager на всё приложение
module.exports = new SessionManager();