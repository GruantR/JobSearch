const AuthHandlers = require('../handlers/authHandlers');
const SessionManager = require('../services/sessionManager');

// Mock бота - объект с такими же методами как реальный бот
const mockBot = {
  sendMessage: (chatId, text) => {
    console.log(`Бот отправил в ${chatId}: ${text}`);
  }
};

// Mock сообщения - объект с такими же полями как реальное сообщение
const mockMsg = {
  chat: { id: 123456 },
  from: { first_name: "TestUser" }
};


const mockUserData = {
  id: 1,
  email: "test@example.com"
};

// Тест 1: Пользователь не авторизован
console.log("=== Тест 1: Неавторизованный пользователь ===");
AuthHandlers.handleLoginCommand(mockBot, mockMsg)

// Очищаем loginAttempts чтобы тесты были независимы
SessionManager.clearLoginAttempt(mockMsg.chat.id,)

// Тест 2: Пользователь авторизован  
console.log("=== Тест 2: Авторизованный пользователь ===");
SessionManager.createSession(mockMsg.chat.id, mockUserData)
AuthHandlers.handleLoginCommand(mockBot, mockMsg)

console.log("🧪 Тестируем AuthHandlers...");

// Очищаем сессию для следующих тестов
SessionManager.deleteSession(mockMsg.chat.id);