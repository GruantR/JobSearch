require("dotenv-flow").config({ default_node_env: "development" });

const logger = require("../utils/logger");
const { models } = require("../models");

/**
 * Создаёт или обновляет учётную запись администратора по переменным окружения.
 * Вызывается после миграций при старте приложения (идемпотентно).
 *
 * Требуется: ADMIN_EMAIL, ADMIN_PASSWORD (пароль не короче 6 символов — как в модели User).
 */
async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  
  if (!email || !password) {
    logger.startup(
      "⏭️  Сидер админа пропущен: задайте ADMIN_EMAIL и ADMIN_PASSWORD"
    );
    return;
  }

  const { User } = models;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    if (existing.role !== "admin") {
      await existing.update({ role: "admin" });
      logger.startup(`✅ Пользователь ${email} получил роль admin`);
    } else {
      logger.startup(`⏭️  Админ уже настроен: ${email}`);
    }
    return;
  }

  await User.create({
    email,
    password,
    role: "admin",
  });
  logger.startup(`✅ Создан администратор (seed): ${email}`);
}

module.exports = { seedAdmin };
