//src/controllers/recruitersController.js

const RecruiterService = require("../services/recruitersService");

class RecruiterController {
  async createRecruiter(req, res, next) {
    try {        
      const data = { ...req.body, userId: req.userId };
      const recruiter = await RecruiterService.createRecruiter(data);
      res.json({
        success: true,
        message: "Рекрутёр успешно добавлен в БД",
        data: { recruiter: recruiter },
      });
    } catch (err) {
      next(err);
    }
  };

  async getRecruiters (req,res,next) {
    try{
        const userId = req.userId;
        const recruiters = await RecruiterService.getRecruiters(userId);
        res.json({
            success: true,
            message: "Ваш список рекрутёров",
            data: {
                recruiters: recruiters
            }
        })
    }catch(err) {
        next(err);
    }
  };

  async getRecruiter (req,res,next){
    try{
        const userId = req.userId;
        const id = req.params.id;
        const recruiter = await RecruiterService.getRecruiter(id, userId);
        res.json({
            success: true,
            message: "Информация о выбранном рекрутере",
            data: {recruiter: recruiter}
        })

    }catch(err){
        next(err);
    }
  };

  async deleteRecruiter (req,res,next) {
    try{
        const userId = req.userId;
        const id = req.params.id;
        const deleteRecruiter = await RecruiterService.deleteRecruiter(id, userId);
        res.json({
            success: true,
            message: 'Выбранный рекрутёр успешно удалён',
            data: {
                recruiter: deleteRecruiter
            }
        })

        
    }catch(err){
        next(err);
    }
  };

  async patchRecruiterData(req,res,next) {
    try{
        const userId = req.userId;
        const id = req.params.id;
        const updateData = req.body;
        const updateRecruiter = await RecruiterService.patchRecruiterData(id, userId, updateData)
        res.json({
            success: true,
            message: 'Данные выбранного рекрутёра изменены',
            data: {updateRecruiter: updateRecruiter}
        })
    }catch(err){
        next(err);
    }
  };

  async updateRecruiterStatus(req,res,next) {
    try{
      const userId = req.userId;
      const id = req.params.id;
      const newStatus = req.body.status;
      const notes = req.body.notes;
      const newRecruiterStatus = await RecruiterService.updateRecruiterStatus(id, userId, newStatus, notes);
      const statusMessages = {
        contacting: "📞 Начинаем общение с рекрутером",
        waiting: "⏳ Ждем ответа от рекрутера", 
        in_process: "💬 Активно общаемся с рекрутером",
        got_offer: "🎉 ПОЗДРАВЛЯЕМ! Получен оффер!",
        rejected: "❌ Общение завершено (отказ)",
        archived: "📁 Рекрутер перемещен в архив"
      };

      res.json({
        success: true,
        message: statusMessages[newStatus] || 'Статус успешно изменён',
        data: {
          newRecruiterStatus: newRecruiterStatus
        }
      })


    }catch(err) {
      next(err);
    }
  };

  async getRecruiterWithHistory(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;
    
      
      const recruiter = await RecruiterService.getRecruiterWithHistory(id, userId);
      
      res.json({
        success: true,
        message: "Рекрутер с историей изменений",
        data: { recruiter }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RecruiterController();
