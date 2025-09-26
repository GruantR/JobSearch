const jwt = require("jsonwebtoken");

const authorizeToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Токен отсутствует, требуется авторизация" });
        }

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Неверный или просроченный токен" });
            }
            
            req.userId = decoded.userId; // decoded вместо data
            next();
        });
    } catch (error) {
        console.error("Ошибка в authorizeToken:", error);
        return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
};

module.exports = authorizeToken;