//src/services/analyticsService.js
const { models } = require("../models/index");
const { Recruiter, Vacancy } = models;

class AnalyticsService {
  // === СТАТИСТИКА ПО РЕКРУТЕРАМ ===
  async getRecruitersStats(userId) {
    const recruiters = await Recruiter.findAll({
      where: { userId },
      attributes: ['id', 'status', 'fullName', 'company', 'lastContactDate']
    });
    
    const stats = {
      contacting: 0,  // Нашли, добавили чтобы не потерять
      waiting: 0,     // Написали, ждем ответа
      in_process: 0,  // Активное общение
      got_offer: 0,   // Получили оффер
      rejected: 0,    // Отказ
      archived: 0,    // В архиве
      total: recruiters.length
    };
    
    recruiters.forEach(recruiter => {
      if (stats[recruiter.status] !== undefined) {
        stats[recruiter.status]++;
      }
    });
    
    return stats;
  };

    // Воронка найма (полезная аналитика для соискателя)
    async getRecruitmentFunnel(userId) {
      const stats = await this.getRecruitersStats(userId);

      const totalContacted = stats.waiting + stats.in_process + stats.got_offer + stats.rejected;
      const responseRate = totalContacted > 0 ? 
        ((stats.in_process + stats.got_offer) / totalContacted * 100).toFixed(1) : 0;
      const successRate = totalContacted > 0 ? 
        (stats.got_offer / totalContacted * 100).toFixed(1) : 0;
      
      return {
        counts: {
        notContacted: stats.contacting,      // Нашли, но еще не написали
        waitingResponse: stats.waiting,      // Написали, ждем ответа
        activeConversations: stats.in_process, // Активно общаемся
        gotOffers: stats.got_offer,          // Получили офферы
        rejected: stats.rejected             // Получили отказы
      
      },
      rates: {
        responseRate: `${responseRate}%`,    // Процент ответов на наши сообщения
        successRate: `${successRate}%`,      // Процент офферов от всех контактов
        engagementRate: stats.total > 0 ? 
          `${((stats.in_process + stats.got_offer) / stats.total * 100).toFixed(1)}%` : '0%' // Активность от общего числа
      }
    };
    };


      // === СТАТИСТИКА ПО ВАКАНСИЯМ ===
  async getVacanciesStats(userId) {
    const vacancies = await Vacancy.findAll({
      where: { userId },
      attributes: ['id', 'status', 'jobTitle', 'companyName', 'updatedAt']
    });
    
    const stats = {
      found: 0,       // Нашли вакансию
      applied: 0,     // Откликнулись
      viewed: 0,      // Просмотрено, ответа нет
      noResponse: 0,  // Нет ответа
      invited: 0,     // Приглашение/интервью
      offer: 0,       // Оффер
      rejected: 0,    // Отказ
      archived: 0,    // В архиве
      total: vacancies.length
    };
    
    vacancies.forEach(vacancy => {
      if (stats[vacancy.status] !== undefined) {
        stats[vacancy.status]++;
      }
    });
    
    return stats;
  }
  


    // Воронка откликов на вакансии
    async getVacanciesFunnel(userId) {
      const stats = await this.getVacanciesStats(userId);
    const totalActive = stats.applied + stats.viewed + stats.noResponse + stats.invited + stats.offer;
      const interviewRate = stats.applied > 0 ? 
      (stats.invited / stats.applied * 100).toFixed(1) : 0;
    const offerRate = stats.invited > 0 ? 
      (stats.offer / stats.invited * 100).toFixed(1) : 0;
      const successRate = stats.applied > 0 ? 
        (stats.offer / stats.applied * 100).toFixed(1) : 0;
      
      // Активные вакансии (исключая архив и найденные без отклика)      
      return {
        counts: {

        found: stats.found,                  // Нашли, но не откликнулись
        applied: stats.applied,              // Откликнулись
      viewed: stats.viewed,                // Просмотрены, ответ не получен
      awaitingResponse: stats.noResponse,  // Нет ответа
      invited: stats.invited,              // Приглашение/интервью
        offers: stats.offer,                 // Получили офферы
        rejected: stats.rejected             // Получили отказы
        },
        rates: {
          applicationRate: stats.found > 0 ? 
            `${(stats.applied / stats.found * 100).toFixed(1)}%` : '0%', // Процент откликов от найденных
          interviewRate: `${interviewRate}%`,  // Процент приглашений на собеседование от откликов
          offerRate: `${offerRate}%`,          // Процент офферов от собеседований
          successRate: `${successRate}%`       // Общий успех (офферы от всех откликов)
        }
  
      };
    }
  
}

module.exports = new AnalyticsService