//bot/config.js

require("dotenv-flow").config();

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/$/, "");
}

/**
 * Базовый HTTPS-URL сервиса без пути (для webhook Telegram).
 * На Render: PUBLIC_URL, WEBHOOK_URL или RENDER_EXTERNAL_URL (HTTPS, без пути к /api-docs).
 */
function getWebhookBaseUrl() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  const raw =
    process.env.PUBLIC_URL ||
    process.env.WEBHOOK_URL ||
    process.env.WEBHOOK_BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "";
  return stripTrailingSlash(raw) || null;
}

module.exports = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  get webhookUrl() {
    return getWebhookBaseUrl();
  },
};
