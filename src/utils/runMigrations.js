const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

/** Применяет pending-миграции из `src/migrations/`. */
async function runMigrations() {
  const { version: umzugVersion } = require("umzug/package.json");
  if (parseInt(umzugVersion, 10) < 3) {
    throw new Error(
      `Нужен umzug 3.x (сейчас ${umzugVersion}). Выполните: npm install umzug@^3.8.2`
    );
  }

  const { Umzug, SequelizeStorage } = require("umzug");

  const umzug = new Umzug({
    migrations: {
      glob: ["migrations/*.js", { cwd: path.join(__dirname, "..") }],
      resolve: ({ name, path: migrationPath, context: queryInterface }) => {
        const migration = require(migrationPath);
        return {
          name,
          up: async () => migration.up(queryInterface, Sequelize),
          down: async () => migration.down(queryInterface, Sequelize),
        };
      },
    },
    context: () => sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: {
      info: () => {},
      warn: () => {},
      error: console.error,
      debug: () => {},
    },
  });

  await umzug.up();
}

module.exports = { runMigrations };
