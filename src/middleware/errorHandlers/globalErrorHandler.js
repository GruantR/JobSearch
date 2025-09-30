const handleSequelizeErrors = require('./sequelizeErrorHandler');
const {AppError} = require('../../errors/customErrors');


const globalErrorHandler = (error, req, res, next) => {
    // 1. Логируем ошибку для разработчика
    console.error('🔥 Error:', {
      message: error.message,    // Сообщение ошибки
      stack: error.stack,        // Стек вызовов (где произошла ошибка)
      url: req.url,              // Какой URL запрашивали
      method: req.method,        // Метод запроса (GET, POST, etc.)
      body: req.body             // Данные запроса (для отладки)
    });
  
    // 2. Обрабатываем ошибки Sequelize
    // Преобразуем технические ошибки БД в понятные кастомные ошибки
    const processedError = handleSequelizeErrors(error);
  
    // 3. Если это наша кастомная ошибка - используем ее статус код
    if (processedError instanceof AppError) {
      return res.status(processedError.statusCode).json({
        success: false,          // Единый формат ответа
        message: processedError.message, // Понятное сообщение для клиента
        // В разработке можем показывать стектрейс
        ...(process.env.NODE_ENV === 'development' && { stack: processedError.stack })
      });
    }
  
    // 4. Непредвиденные ошибки (баги) - общий ответ
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      // В development режиме показываем детали для отладки
      ...(process.env.NODE_ENV === 'development' && { 
        error: processedError.message,
        stack: processedError.stack 
      })
    });
  };

  module.exports = globalErrorHandler;