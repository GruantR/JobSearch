//src/bot/utils/errorHandler.js
const {
    AuthenticationError,
    NotFoundError,
    ValidationError,
    ConflictError,
    StatusValidationError,
    StructuredValidationError,
} = require('../../errors/customErrors');

function handleBotError(error) {
    console.error('Ошибка в боте:', error.name, error.message);

    // 1. Обработка Sequelize ошибок
    if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => `• ${err.message}`).join('\n');
        return `❌ Ошибки в данных:\n${messages}\nПопробуйте снова`;
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
        return '❌ Такие данные уже существуют';
    }

    // 2. Обработка кастомных ошибок
    if (error instanceof StructuredValidationError) {
        const messages = error.errors.map(err => `• ${err.message}`).join('\n');
        return `❌ Ошибки в данных:\n${messages}`;
    }

    if (error instanceof StatusValidationError) {
        return `❌ ${error.message}`;
    }

    if (error instanceof AuthenticationError) {
        return '🔐 Неверный email или пароль';
    }

    if (error instanceof NotFoundError) {
        return '❌ Ресурс не найден';
    }

    if (error instanceof ValidationError || error instanceof ConflictError) {
        return `❌ ${error.message}`;
    }

    return '❌ Произошла ошибка. Попробуйте еще раз';
}

module.exports = { handleBotError };