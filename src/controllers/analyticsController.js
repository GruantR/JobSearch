// src/controllers/analyticsController.js
const AnalyticsService = require('../services/analyticsService');

class AnalyticsController {

    async getRecruitersStats (req,res,next){
        try{
            const userId = req.userId;
            const data = await AnalyticsService.getRecruitersStats(userId);
            res.json({
                success:true,
                message: 'Статистика по рекрутерам',
                data: {
                    data: data
                }
            })
        }catch(err) {
            next(err);
        }
    }

    async getRecruitmentFunnel (req, res, next) {
        try{
            const userId = req.userId;
            const data = await AnalyticsService.getRecruitmentFunnel(userId);
            res.json({
                success:true,
                message: 'Воронка поиска работы',
                data: {
                    data: data
                }
            })
        }catch(err) {
            next(err);
        }
    }

};

module.exports = new AnalyticsController();
