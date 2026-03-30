# JobSearch

Backend API и Telegram-бот для учёта вакансий и рекрутеров.

## Первый запуск

1. **Среда:** Node.js 18+, установленный и запущенный PostgreSQL.

2. **Код и зависимости:**
   ```bash
   git clone <url-репозитория>
   cd JobSearch
   npm install
   ```

3. **База:** создайте пустую БД (имя по умолчанию — `job_search`):
   ```bash
   createdb job_search
   ```
   Либо создайте её в pgAdmin / другом клиенте с тем же именем.

4. **Переменные окружения:** в корне проекта создайте файл **`.env.development`** (удобнее для разработки) или **`.env`**. Загрузка идёт через [dotenv-flow](https://github.com/kerimdzhanov/dotenv-flow); при запуске без `NODE_ENV` используется режим development, как у `npm run dev`.

   Обязательно задайте **`SECRET_KEY`** (секрет для JWT).

   Задайте **`TELEGRAM_BOT_TOKEN`**, либо отключите бота: **`ENABLE_BOT=false`** (тогда токен не нужен).

   Для локального PostgreSQL без `DATABASE_URL` проверьте **`DB_NAME`**, **`DB_USER`**, **`DB_PASS`**, **`DB_HOST`**, **`DB_PORT`** — они должны совпадать с вашим пользователем и паролем в PostgreSQL. Значения по умолчанию в коде: БД `job_search`, пользователь `postgres`, пароль `password`, хост `localhost`, порт `5432` (см. `src/config/db.js`).

5. **Старт:**
   ```bash
   npm run dev
   ```
   На Windows при необходимости: `npm run dev:win`.

   После подключения к БД применяются миграции из `src/migrations/` (если не задано `RUN_MIGRATIONS_ON_START=false`).

6. **Проверка:** откройте Swagger — `http://localhost:3000/api-docs` (порт меняется через `PORT`).

## Переменные (кратко)

| Переменная | Нужна | Значение |
|------------|-------|----------|
| `SECRET_KEY` | Да | Секрет для подписи JWT |
| `TELEGRAM_BOT_TOKEN` | Да, если бот включён | Токен бота; иначе `ENABLE_BOT=false` |
| `ENABLE_BOT` | Нет | `false` — не запускать Telegram-бота |
| `DATABASE_URL` | Нет | Если задана — подключение к PostgreSQL через неё (часто прод) |
| `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT` | Нет | Локальная БД без `DATABASE_URL` |
| `PORT` | Нет | HTTP-порт, по умолчанию `3000` |
| `RUN_MIGRATIONS_ON_START` | Нет | `false` — не выполнять миграции при старте сервера |

## Команды

| Команда | Назначение |
|---------|------------|
| `npm run dev` | Разработка (nodemon, `NODE_ENV=development`) |
| `npm start` | Запуск без nodemon |
| `npm run prod` | Продакшен (`NODE_ENV=production`) |

API: `http://localhost:<PORT>/api`.
