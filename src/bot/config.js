require('dotenv-flow').config();

module.exports = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  webhookUrl: process.env.NODE_ENV === 'production' 
    ? 'https://jobsearch-xsjk.onrender.com' 
    : null // В development используем polling
};