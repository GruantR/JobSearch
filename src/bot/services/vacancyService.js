const { models } = require("../../models/index");
const { Vacancy } = models;

class VacancyService {
  // Получить все вакансии
  static async getAllVacancies(limit = 10) {
    try {
      const vacancies = await Vacancy.findAll({
        limit: limit,
        order: [['createdAt', 'DESC']]
      });
      vacancies.forEach(v => {
        console.log(`   - ID: ${v.id}, JobTitle: "${v.jobTitle}", Company: "${v.companyName}"`);
      });      
      return vacancies;
    } catch (error) {
      console.error('❌ Ошибка при получении вакансий:', error);
      return [];
    }
  }

  // Получить вакансию по ID
  static async getVacancyById(id) {
    try {
      const vacancy = await Vacancy.findByPk(id);
      return vacancy;
    } catch (error) {
      console.error('❌ Ошибка при получении вакансии:', error);
      return null;
    }
  }

  // Форматировать вакансию для красивого вывода в Telegram
  static formatVacancyForTelegram(vacancy) {
    return `
🏢 **${vacancy.jobTitle || 'Без названия'}**

👨‍💼 Компания: ${vacancy.companyName || 'Не указана'}
💰 Зарплата: ${vacancy.salary || 'Не указана'}
🔗 Ссылка: ${vacancy.source_url || 'Нет ссылки'}
📋 Платформа: ${vacancy.sourcePlatform || 'Не указана'}

📝 Описание: ${vacancy.description || 'Нет описания'}

📅 Дата подачи: ${vacancy.applicationDate ? new Date(vacancy.applicationDate).toLocaleDateString('ru-RU') : 'Не указана'}
📝 Заметки: ${vacancy.notes || 'Нет заметок'}

🆔 ID: ${vacancy.id}
📅 Создана: ${new Date(vacancy.createdAt).toLocaleDateString('ru-RU')}
    `.trim();
  }

  // Форматировать список вакансий
  static formatVacanciesList(vacancies) {
    if (vacancies.length === 0) {
      return '📭 Список вакансий пуст.';
    }

    let message = `📋 **Найдено вакансий: ${vacancies.length}**\n\n`;
    
    vacancies.forEach((vacancy, index) => {
      message += `${index + 1}. **${vacancy.jobTitle || 'Без названия'}**\n`;
      message += `   👨‍💼 ${vacancy.companyName || 'Компания не указана'}\n`;
      message += `   💰 ${vacancy.salary || 'З/П не указана'}\n`;
      message += `   🆔 ${vacancy.id}\n\n`;
    });

    message += '\n💡 Используйте /vacancy <ID> для подробной информации';
    
    return message;
  }
}

module.exports = VacancyService;