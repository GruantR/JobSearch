const jwt = require("jsonwebtoken");

const authorizeToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Проверяем наличие заголовка
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Требуется авторизация",
        error: "Authorization header отсутствует"
      });
    }

    // Извлекаем токен (Bearer <token>)
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Токен отсутствует", 
        error: "Bearer token не найден в заголовке"
      });
    }

    // Верифицируем токен с помощью async/await
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // Добавляем данные пользователя в запрос
    req.userId = decoded.userId;
    req.user = decoded; // Можно сохранить все данные из токена
    
    next();
    
  } catch (error) {
    console.error("Ошибка в authorizeToken:", error);

    // Детальная обработка разных типов JWT ошибок
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: "Неверный токен",
        error: "Токен не может быть верифицирован"
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false, 
        message: "Токен просрочен",
        error: "Срок действия токена истек"
      });
    }

    // Любые другие ошибки
    return res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера при проверке токена"
    });
  }
};

module.exports = authorizeToken;