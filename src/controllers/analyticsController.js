// src/controllers/analyticsController.js
const AnalyticsService = require('../services/analyticsService');

class AnalyticsController {

    async getRecruitersStats (req,res,next){
        try{
            const userId = req.userId;
            const data = await AnalyticsService.getRecruitersStats(userId);
            res.json({
                success:true,
                message: 'Базовая статистика по рекрутерам: общее количество по статусам',
                data: {
                    data: data
                }
            })
        }catch(err) {
            next(err);
        }
    };

    async getRecruitmentFunnel (req, res, next) {
        try{
            const userId = req.userId;
            const data = await AnalyticsService.getRecruitmentFunnel(userId);
            res.json({
                success:true,
                message: 'Воронка эффективности работы с рекрутерами. Counts - абсолютные числа, Rates - проценты эффективности. Response Rate - процент ответов на сообщения, Success Rate - процент офферов от всех контактов, Engagement Rate - общая активность.',
                data: {
                    data: data
                }
            })
        }catch(err) {
            next(err);
        }
    };

    async getVacanciesStats (req,res,next){
        try{
            const userId = req.userId;
            const data = await AnalyticsService.getVacanciesStats(userId);
            res.json({
                success:true,
                message: 'Базовая статистика по вакансиям: общее количество по статусам',
                data: {
                    data: data
                }
            })
        }catch(err) {
            next(err);
        }
    };

    async getVacanciesFunnel (req, res, next) {
        try{
            const userId = req.userId;
            const data = await AnalyticsService.getVacanciesFunnel(userId);
            res.json({
                success:true,
                message: 'Воронка эффективности откликов на вакансии. Counts - абсолютные числа, Rates - проценты эффективности. Application Rate - как часто откликаетесь на найденное, Interview Rate - как часто получаете собеседования, Offer Rate - успешность собеседований, Success Rate - общая эффективность поиска.',
                data: {
                    data: data
                }
            })
        }catch(err) {
            next(err);
        }
    };




};

module.exports = new AnalyticsController();
