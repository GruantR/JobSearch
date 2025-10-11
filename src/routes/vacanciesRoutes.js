const express = require('express');
const router = express.Router();
const VacanciesController = require('../controllers/VacanciesController');
const authorizeToken = require('../middleware/authorizeToken');

router.post('/', authorizeToken, VacanciesController.createVacancy);

module.exports = router;
