const StatusHistoryService = require('../services/statusHistoryService');

class StatusHistoryController {
    async getRecruiterStatusHistory (req,res,next) {
        try {
            const { id } = req.params;
            const history = await StatusHistoryService.getStatusHistory('recruiter',id);
            res.json({
                success: true,
                message: "История изменений статуса рекрутера",
                data: {
                    data: {history}
                }
            })
        }catch(err){
            next(err);
        }
    }
};

module.exports = new StatusHistoryController();

