const express = require('express');
const router = express.Router();
const VacanciesController = require('../controllers/VacanciesController');
const authorizeToken = require('../middleware/authorizeToken');
const StatusHistoryController = require('../controllers/statusHistoryController');
const VacancyRoutesValidation = require('../middleware/validators/vacancyRoutesValidation');
const handleValidationErrors = require('../middleware/errorHandlers/validationErrorHandler');

router.post('/', authorizeToken, VacancyRoutesValidation.validateCreateVacancy(), handleValidationErrors, VacanciesController.createVacancy);
router.get('/', authorizeToken, VacanciesController.getVacancies);
router.get('/:id', authorizeToken, VacanciesController.getVacancy);
router.delete('/:id', authorizeToken, VacanciesController.deleteVacancy);
router.patch('/:id', authorizeToken, VacanciesController.patchVacancyData);
router.patch('/:id/status', authorizeToken, VacanciesController.updateVacancyStatus);
router.get('/:id/status',authorizeToken, StatusHistoryController.getVacanciesStatusHistory);
router.get('/:id/with-history', authorizeToken, VacanciesController.getVacancyWithHistory);

module.exports = router;
