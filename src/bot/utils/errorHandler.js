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
    if (error instanceof AuthenticationError) {
        return '🔐 Неверный email или пароль';
    }

    if (error instanceof NotFoundError) {
        return '❌ Ресурс не найден';
    }

    if (error instanceof ValidationError) {
        return '❌ Некорректные данные';
    }

    if (error instanceof ConflictError) {
        return '❌ Такой пользователь уже существует';
    }

    if (error instanceof BadRequestError) {
        return '❌ Некорректный запрос';
    }

    if (error instanceof StatusValidationError) {
        return '❌ Недопустимое изменение статуса';
    }

    console.error('Необработанная ошибка в боте:', error);
    return '❌ Произошла непредвиденная ошибка. Попробуйте позже.';
}

module.exports = {handleBotError};