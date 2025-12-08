//src/models/index.js
const sequelize = require("../config/db");

// Импортируем модели
const User = require("./User");
const UserProfile = require("./UserProfile");
const Recruiter = require("./Recruiter");
const StatusHistory = require("./StatusHistory");
const Vacancy = require("./Vacancy");

// Определяем отношения
// СВЯЗЬ ОДИН К ОДНОМУ
// Со стороны User: "У одного пользователя есть один профиль"
User.hasOne(UserProfile, {
  foreignKey: "userId",           // В таблице UserProfile будет столбец userId
  onDelete: "CASCADE",            // При удалении User - удалить и UserProfile
});

// Со стороны UserProfile: "Профиль принадлежит пользователю" 
UserProfile.belongsTo(User, {
  foreignKey: "userId",           // Уточняем, какой столбец является внешним ключом
});
/* 
Sequelize понимает, что это отношение один-к-одному
В таблице user_profiles будет столбец userId, который ссылается на id в таблице users
При удалении пользователя, его профиль тоже удалится
*/


// СВЯЗЬ ОДИН КО МНОГИМ
// Со стороны User: "У одного пользователя может быть много рекрутеров"
User.hasMany(Recruiter, {
  foreignKey: "userId",         // В таблице recruiters будет столбец userId
  onDelete: "CASCADE",          // При удалении User - удалить все его рекрутеры
});

// Со стороны Recruiter: "Рекрутер принадлежит пользователю"
Recruiter.belongsTo(User, {
  foreignKey: "userId",         // Уточняем внешний ключ
});

User.hasMany(Vacancy, {
  foreignKey: "userId",         // В таблице vacancy будет столбец userId
  onDelete: "CASCADE",          // При удалении User - удалить все его вакансии
});

// Со стороны Vacancy: "Вакансия принадлежит пользователю"
Vacancy.belongsTo(User, {
  foreignKey: "userId",         // Уточняем внешний ключ
});

// Рекрутер имеет много записей истории
Recruiter.hasMany(StatusHistory, {
  foreignKey: 'entityId',
  constraints: false,
  scope: { entityType: 'recruiter' }, // фильтр: только для рекрутеров, Sequelize автоматически добавлял условие WHERE entityType = 'recruiter' 
  as: 'statusHistory'
});


// Вакансия имеет много записей истории  
Vacancy.hasMany(StatusHistory, {
  foreignKey: 'entityId', 
  constraints: false,
  scope: { entityType: 'vacancy' }, // фильтр: только для вакансий
  as: 'statusHistory'
});

// Запись истории может принадлежать рекрутеру ИЛИ вакансии
StatusHistory.belongsTo(Recruiter, { foreignKey: 'entityId', constraints: false });
StatusHistory.belongsTo(Vacancy, { foreignKey: 'entityId', constraints: false });


// Экспортируем модели и функцию инициализации
const models = {
  sequelize,
  User,
  UserProfile,
  Recruiter,
  StatusHistory,
  Vacancy,
};

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ База данных подключена (${process.env.NODE_ENV})`);

    const syncOptions = {
  force: false, // ⚠️ УДАЛЯЕТ все таблицы и пересоздаёт их
  logging: false
};

    // 🔴 ВАЖНО: В production НИКОГДА не используем sync!
    if (process.env.NODE_ENV === "development") {
      // Только в разработке
      const syncOptions = {
        alter: false, // ⚠️ Лучше false для безопасности
        force: false, // ⚠️ Никогда true в продакшене!
        logging: false
      };
      
      await sequelize.sync(syncOptions);
      console.log("🔄 Режим разработки: sync выполнен");
    } else {
      // В production вообще не вызываем sync
      console.log("🔒 Production: sync пропущен, используйте миграции");
    }


    return true;
  } catch (error) {
    console.error("❌ Ошибка БД:", error.message);
    return false;
  }
};

module.exports = { models, initializeDatabase }; // Контролируемый экспорт
