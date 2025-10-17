const VacanciesService = require("../services/vacanciesService");

class VacanciesController {
  async createVacancy(req, res, next) {
    try {
      const vacancy = await VacanciesService.createVacancy({
        ...req.body,
        userId: req.userId,
      });
      res.status(201).json({
        success: true,
        message: "Вакансия успешно добавленна",
        data: {
          vacancy: vacancy,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getVacancies(req, res, next) {
    try {
      const userId = req.userId;
      const vacancies = await VacanciesService.getVacancies(userId);
      res.json({
        success: true,
        message: "Ваш список вакансий",
        data: {
          vacancies: vacancies,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getVacancy(req, res, next) {
    try {
      const userId = req.userId;
      const id = req.params.id;
      const vacancy = await VacanciesService.getVacancy(id, userId);
      res.json({
        success: true,
        message: "Информация о выбранной вакансии",
        data: { vacancy: vacancy },
      });
    } catch (err) {
        next (err);
    }
  }

  async deleteVacancy (req,res, next) {
    try{
        const userId = req.userId;
        const id = req.params.id;
        const deleteVacancy = await VacanciesService.deleteVacancy(id, userId);
        res.json({
            success: true,
            message: "Выбранная вакансия удалена",
            data: {
                deleteVacancy: deleteVacancy
            }
        })
    }catch(err){
        next(err)
    }
  };

  async patchVacancyData (req, res, next){
    try{
        const userId = req.userId;
        const id = req.params.id;
        const updateData = req.body;
        const updateVacancy = await VacanciesService.patchVacancyData(id, userId, updateData);
        res.json({
            success: true,
            message: 'Данные выбранной вакансии успешно обновлены',
            data: {
                updateVacancy: updateVacancy 
            }
        })
    }catch(err) {
        next(err)
    }
  };

  async updateVacancyStatus (req, res, next) {
    try{
        const userId = req.userId;
        const id = req.params.id;
        const newStatus = req.body.status;
        const notes = req.body.notes;
        const newVacancyStatus = await VacanciesService.updateVacancyStatus(id, userId, newStatus, notes);
        const statusMessages = {
            found: "Найдена вакансия 🔍 - начальный статус при обнаружении интересной вакансии",
            applied: "Откликнулся 📤 - активное действие отправки отклика", 
            waiting: "В ожидании ответа ⏳ - период ожидания реакции работодателя",
            interview: "Собеседование 💼 - процесс проведения собеседований",
            got_offer: "Получен оффер 🎉 - успешный результат, получение предложения",
            rejected: "Отказ ❌ - негативный результат",
            archived: "В архиве 📁 - завершающий статус для хранения истории"
          };
          res.json({
            success: true,
            message: statusMessages[newStatus] || 'Статус успешно изменён',
            data: {
                newVacancyStatus: newVacancyStatus
            }
          })

    }catch(err) {
        next(err)
    }
  };

  async getVacancyWithHistory (req, res, next) {
    try{
        const id = req.params.id;
        const userId = req.userId;
        const vacancy = await VacanciesService.getVacancyWithHistory(id, userId);
        res.json({
            success: true,
            message: 'Вакансия с историей изменений статуса',
            data: {
                vacancy: vacancy
            }
        })

    }catch(err) {
        next(err)
    }
  }
}

module.exports = new VacanciesController();
