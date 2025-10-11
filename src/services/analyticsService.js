//src/services/analyticsService.js
const { models } = require("../models/index");
const { Recruiter } = models;

class AnalyticsService {
  // Базовая статистика по статусам
  async getRecruitersStats(userId) {
    const recruiters = await Recruiter.findAll({
      where: { userId },
      attributes: ['id', 'status', 'fullName', 'company', 'lastContactDate']
    });
    
    const stats = {
      contacting: 0,
      waiting: 0, 
      in_process: 0,
      got_offer: 0,
      rejected: 0,
      archived: 0,
      total: recruiters.length
    };
    
    recruiters.forEach(recruiter => {
      if (stats[recruiter.status] !== undefined) {
        stats[recruiter.status]++;
      }
    });
    
    return stats;
  }
  
  // Воронка найма (полезная аналитика для соискателя)
  async getRecruitmentFunnel(userId) {
    const stats = await this.getRecruitersStats(userId);
    
    return {
      contacted: stats.contacting + stats.waiting + stats.in_process,
      activeConversations: stats.in_process,
      offers: stats.got_offer,
      successRate: stats.total > 0 ? ((stats.got_offer / stats.total) * 100).toFixed(1) + '%' : '0%'
    };
  }
}

module.exports = new AnalyticsService