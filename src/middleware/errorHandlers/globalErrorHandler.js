//src middleware/errorHandlers/globalErrorHandler.js
const handleSequelizeErrors = require("./sequelizeErrorHandler");
const { AppError, StructuredValidationError } = require("../../errors/customErrors");
const logger = require("../../utils/logger");

const isProduction = process.env.NODE_ENV === "production";

/** Ключи и паттерны имён полей, которые нельзя писать в логи. */
function isSensitiveKey(key) {
  const k = String(key).toLowerCase();
  if (
    k === "password" ||
    k === "token" ||
    k === "authorization" ||
    k === "secret" ||
    k === "accesstoken" ||
    k === "refreshtoken" ||
    k === "secretkey"
  ) {
    return true;
  }
  if (k.includes("password") || k.includes("secret")) return true;
  if (k.endsWith("token")) return true;
  return false;
}

/**
 * Рекурсивно маскирует чувствительные поля в объекте тела запроса (копия для лога).
 */
function sanitizeBodyForLog(body, depth = 0) {
  if (body === undefined || body === null) return body;
  if (depth > 6) return "[MaxDepth]";
  if (typeof body !== "object") return body;
  if (Array.isArray(body)) {
    return body.map((item) =>
      item !== null && typeof item === "object"
        ? sanitizeBodyForLog(item, depth + 1)
        : item
    );
  }
  const out = {};
  for (const [key, value] of Object.entries(body)) {
    if (isSensitiveKey(key)) {
      out[key] = "[REDACTED]";
      continue;
    }
    if (value !== null && typeof value === "object") {
      out[key] = sanitizeBodyForLog(value, depth + 1);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function buildErrorLogPayload(req, error) {
  const base = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  };
  if (isProduction) {
    return base;
  }
  if (req.body !== undefined && req.body !== null && Object.keys(req.body).length > 0) {
    base.body = sanitizeBodyForLog(req.body);
  }
  return base;
}

const globalErrorHandler = (error, req, res, next) => {
  logger.error("🔥 Error:", buildErrorLogPayload(req, error));

  const processedError = handleSequelizeErrors(error);

  if (processedError instanceof AppError) {
    if (processedError instanceof StructuredValidationError) {
      return res.status(processedError.statusCode).json({
        success: false,
        message: processedError.message,
        errors: processedError.errors,
      });
    }
    return res.status(processedError.statusCode).json({
      success: false,
      message: processedError.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Внутренняя ошибка сервера",
  });
};

module.exports = globalErrorHandler;
