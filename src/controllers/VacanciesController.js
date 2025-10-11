const VacanciesService = require('../services/vacanciesService');

class VacanciesController {
    async createVacancy (req, res, next) {
        try{
        const data = { ...req.body, userId: req.userId };
        const vacancy = await VacanciesService.createVacancy(data);
            res.json({
                success: true,
                message: 'Вакансия успешно добавленна',
                data: {
                    data: vacancy
                }
            })


        }catch(err){
            next(err)
        }
    }
}

module.exports = new VacanciesController();