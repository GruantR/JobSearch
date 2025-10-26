//src/bot/utils/errorHandler.js

const {
    AuthenticationError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
    ConflictError,
    BadRequestError,
    StatusValidationError,
} = require('../../errors/customErrors');

function handleBotError(error) {
    console.error('Ошибка в боте:', error);

    // 🔥 ПРОСТАЯ И ПОНЯТНАЯ ОБРАБОТКА:
    
    // 1. Ошибки авторизации
    if (error instanceof AuthenticationError) {
        return '🔐 Неверный email или пароль';
    }

    // 2. Ошибки валидации статуса (самые частые)
    if (error instanceof StatusValidationError) {
        return `❌ ${error.message}`; // Показываем сообщение как есть
    }

    // 3. Ресурс не найден
    if (error instanceof NotFoundError) {
        return '❌ Ресурс не найден';
    }

    // 4. Другие ошибки валидации
    if (error instanceof ValidationError) {
        return '❌ Некорректные данные';
    }

    // 5. Все остальные ошибки
    return '❌ Произошла ошибка. Попробуйте еще раз';
}

module.exports = {handleBotError};