  require("dotenv").config();
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) res.status(401).send("Токен отсутсвует, требуется авторизация");
    jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
      //if (err) next(new Error("invalid token"));
      if (err) return res.status(403).json({ message: "Неверный токен" });
      
      req.userId = data.userId;

      next();
    });
  } catch (error) {
    console.error("Ошибка в authenticateToken:", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
module.exports = authenticateToken;