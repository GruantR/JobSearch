const { ForbiddenError } = require("../errors/customErrors");

/** Использовать только после `authorizeToken`. */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(
      new ForbiddenError("Доступ запрещён: требуются права администратора")
    );
  }
  next();
}

module.exports = requireAdmin;
