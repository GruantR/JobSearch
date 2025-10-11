//src/services/vacanciesService.js

const {models} = require('../models/index');
const {Vacancy} = models;

class VacanciesService {
    async createVacancy (info) {
        const vacancy = await Vacancy.create(info);
        return vacancy
    }

}

module.exports = new VacanciesService();