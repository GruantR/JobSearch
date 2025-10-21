class SessionManager {
  constructor() {
    // Создаём хранилище для сессий (ключ: chatId, значение: данные пользователя)
    this.sessions = new Map(); 
    // Создаём хранилище для попыток входа (ключ: chatId, значение: процесс логина)
    this.loginAttempts = new Map(); 
  }

  // Создание сессии - "заселяем пользователя в номер"
  createSession(chatId, userData) {
    // Создаём объект сессии с данными пользователя и временными метками
    const session = {
      user: userData,           // Данные пользователя (id, email)
      createdAt: new Date(),    // Когда создана сессия
      lastActivity: new Date()  // Когда пользователь последний раз был активен
    };
    // Сохраняем сессию в хранилище
    this.sessions.set(chatId, session);
    // Возвращаем созданную сессию (можно использовать если нужно)
    return session;
  }

  // Получение сессии - "проверяем кто в номере"
  getSession(chatId) {
    // Достаём сессию из хранилища по chatId
    const session = this.sessions.get(chatId);
    // Если сессия найдена - обновляем время последней активности
    if (session) {
      session.lastActivity = new Date(); // Пользователь что-то сделал - обновляем время
    }
    // Возвращаем сессию (или undefined если не найдена)
    return session;
  }

  // Удаление сессии - "выселяем пользователя из номера"
  deleteSession(chatId) {
    // Удаляем сессию из хранилища
    this.sessions.delete(chatId);
    // ⚠️ НЕТ return - метод просто удаляет, ничего не возвращает
  }

  // Проверка аутентификации - "проверяем заселен ли пользователь"
  isAuthenticated(chatId) {
    // Проверяем существует ли сессия с таким chatId
    return this.sessions.has(chatId);
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
  clearLoginAttempt(chatId) {
    // Удаляем попытку входа из хранилища
    this.loginAttempts.delete(chatId);
    // ⚠️ НЕТ return - просто очищаем
  }
}

// Создаём единственный экземпляр SessionManager на всё приложение
module.exports = new SessionManager();