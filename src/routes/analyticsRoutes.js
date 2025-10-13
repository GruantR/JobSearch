//src/routes/analyticsRoutes.js
const express = require ('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const authorizeToken = require('../middleware/authorizeToken');


router.get('/recruiters-stats', authorizeToken, AnalyticsController.getRecruitersStats);
router.get('/recruitment-funnel', authorizeToken, AnalyticsController.getRecruitmentFunnel);
router.get ('/vacancies-stats', authorizeToken, AnalyticsController.getVacanciesStats);
router.get('/vacancies-funnel', authorizeToken, AnalyticsController.getVacanciesFunnel);

module.exports = router;