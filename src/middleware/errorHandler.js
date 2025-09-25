// ==============================
// КОНФИГУРАЦИЯ ОШИБОК - РЕДАКТИРУЙ ЗДЕСЬ
// ==============================

// Названия полей для человекочитаемых сообщений
const fieldNames = {
    // Пользователи
    'email': 'email',
    'username': 'имя пользователя', 
    'phone': 'номер телефона',
    'password': 'пароль',
    
    // Компании
    'inn': 'ИНН',
    'company_name': 'название компании',
    'ogrn': 'ОГРН',
    
    // Товары
    'sku': 'артикул',
    'product_code': 'код товара',
    'vendor_code': 'вендорский код'
    // Добавляй новые поля по мере необходимости...
};

// Специальные сообщения для уникальных полей (если нужны кастомные)
const uniqueFieldMessages = {
    'email': (value) => `Пользователь с email '${value}' уже существует`,
    'username': (value) => `Имя пользователя '${value}' уже занято`,
    'phone': (value) => `Номер телефона '${value}' уже зарегистрирован`,
    'inn': (value) => `Организация с ИНН '${value}' уже зарегистрирована`
    // Добавляй кастомные сообщения для важных полей...
};

// Карта обработки всех типов ошибок
const errorMap = {
    // ========================
    // SEQUELIZE ОШИБКИ
    // ========================
    'SequelizeValidationError': {
        status: 400,
        message: 'Ошибка валидации данных',
        getDetails: (error) => error.errors.map(err => 
            err.message || 'Некорректное значение поля'
        )
    },
    
    'SequelizeUniqueConstraintError': {
        status: 400, 
        message: 'Конфликт данных',
        getDetails: (error) => {
            const field = error.errors[0]?.path;
            const value = error.errors[0]?.value;
            
            // Используем кастомное сообщение если есть
            if (uniqueFieldMessages[field]) {
                return [uniqueFieldMessages[field](value)];
            }
            
            // Иначе генерируем автоматическое сообщение
            const fieldName = fieldNames[field] || field;
            return [`${fieldName} '${value}' уже используется`];
        }
    },
    
    'SequelizeDatabaseError': {
        status: 503,
        message: 'Ошибка базы данных'
    },
    
    'SequelizeConnectionError': {
        status: 503,
        message: 'Нет подключения к базе данных'
    },
    
    'SequelizeTimeoutError': {
        status: 504,
        message: 'Таймаут запроса к базе данных'
    },
    
    // ========================
    // АВТОРИЗАЦИЯ И АУТЕНТИФИКАЦИЯ
    // ========================
    'AuthenticationError': {
        status: 401,
        message: 'Требуется авторизация'
    },
    
    'AuthorizationError': {
        status: 403, 
        message: 'Доступ запрещен'
    },
    
    'InvalidTokenError': {
        status: 401,
        message: 'Недействительный токен'
    },
    
    'TokenExpiredError': {
        status: 401,
        message: 'Срок действия токена истек'
    },
    
    // ========================
    // ВАЛИДАЦИЯ ДАННЫХ
    // ========================
    'ValidationError': {
        status: 400,
        message: 'Ошибка валидации данных'
    },
    
    'UrlValidationError': {
        status: 400,
        message: 'Некорректный URL'
    },
    
    'FileValidationError': {
        status: 400,
        message: 'Ошибка валидации файла'
    },
    
    // ========================
    // БИЗНЕС-ЛОГИКА
    // ========================
    'NotFoundError': {
        status: 404,
        message: 'Ресурс не найден'
    },
    
    'PaymentError': {
        status: 402,
        message: 'Ошибка оплаты'
    },
    
    'LimitExceededError': {
        status: 429,
        message: 'Превышен лимит запросов'
    },
    
    // ========================
    // СИСТЕМНЫЕ ОШИБКИ
    // ========================
    'ExternalServiceError': {
        status: 502,
        message: 'Ошибка внешнего сервиса'
    },
    
    'FileSystemError': {
        status: 500,
        message: 'Ошибка файловой системы'
    }
};

// ==============================
// ОСНОВНАЯ ЛОГИКА (НЕ РЕДАКТИРУЙ)
// ==============================

/**
 * Обрабатывает ошибку и возвращает структурированный ответ
 */
const handleError = (error) => {
    // Если ошибка уже имеет статус и сообщение (из другого middleware)
    if (error.status && error.message) {
        return {
            status: error.status,
            message: error.message,
            ...(error.details && { details: error.details })
        };
    }
    
    // Ищем конфигурацию для данного типа ошибки
    const errorConfig = errorMap[error.name] || {
        status: 500,
        message: 'Внутренняя ошибка сервера'
    };
    
    // Формируем базовый ответ
    const response = {
        status: errorConfig.status,
        message: errorConfig.message
    };
    
    // Добавляем детали если есть функция для их получения
    if (errorConfig.getDetails) {
        const details = errorConfig.getDetails(error);
        if (details && details.length > 0) {
            response.details = details;
        }
    }
    
    return response;
};

// ==============================
// ПРОСТОЕ ЛОГИРОВАНИЕ (БЕЗ СТЕКТРЕЙСА)
// ==============================

const logError = (error, req) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${error.name}: ${req.method} ${req.path}`);
};

// ==============================
// MIDDLEWARE (ЭКСПОРТ)
// ==============================

module.exports = (error, req, res, next) => {
    // Логируем ошибку
    logError(error, req);
    
    // Обрабатываем ошибку
    const errorResponse = handleError(error);
    
    // Отправляем ответ клиенту
    res.status(errorResponse.status).json({
        success: false,
        error: errorResponse.message,
        ...(errorResponse.details && { details: errorResponse.details })
    });
};

// ==============================
// ВСПОМОГАТЕЛЬНЫЕ КЛАССЫ (ОПЦИОНАЛЬНО)
// ==============================

// Для удобного создания кастомных ошибок
class AppError extends Error {
    constructor(message, name = 'AppError', status = 500, details = null) {
        super(message);
        this.name = name;
        this.status = status;
        if (details) this.details = details;
    }
}

class ValidationError extends AppError {
    constructor(message = 'Ошибка валидации', details = null) {
        super(message, 'ValidationError', 400, details);
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Ресурс') {
        super(`${resource} не найден`, 'NotFoundError', 404);
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Требуется авторизация') {
        super(message, 'AuthenticationError', 401);
    }
}

// Экспортируем классы для использования в сервисах/контроллерах
module.exports.AppError = AppError;
module.exports.ValidationError = ValidationError;
module.exports.NotFoundError = NotFoundError;
module.exports.AuthenticationError = AuthenticationError;
