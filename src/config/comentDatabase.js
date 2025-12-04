// ============================================================================
// КОНФИГУРАЦИЯ ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ ДЛЯ SEQUELIZE CLI
// 
// Назначение: Содержит параметры подключения для разных окружений
// Используется ТОЛЬКО Sequelize CLI при выполнении миграций
// ============================================================================

module.exports = {
  development: {
    username: "postgres",
    password: "postgres",
    database: "job_search",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
    logging: false,
    define: {
      timestamps: true,
      underscored: false
    }
  },
  
  test: {
    username: "postgres",
    password: "postgres",
    database: "job_search_test",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
    logging: false
  },
  
  production: {
    // ============================================================================
    // ПРОДАКШЕН: Используем переменную окружения для безопасности
    // На сервере должна быть установлена переменная:
    // DATABASE_URL=postgresql://neondb_owner:npg_1r9IBjgTloEs@ep-blue-cell-ag6fm77e-pooler.c-2.eu-central-1.aws.neon.tech/job_search?sslmode=require
    // ============================================================================
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};