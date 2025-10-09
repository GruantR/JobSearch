//src/routes/recruitersRoutes.js
const express = require('express');
const router = express.Router();
const RecruiterController = require('../controllers/recruitersController');
const StatusHistoryController = require('../controllers/statusHistoryController');
const authorizeToken = require('../middleware/authorizeToken');



router.post('/', authorizeToken, RecruiterController.createRecruiter);
router.get('/', authorizeToken, RecruiterController.getRecruiters);
router.get('/:id', authorizeToken, RecruiterController.getRecruiter);
router.delete('/:id', authorizeToken, RecruiterController.deleteRecruiter);
router.patch('/:id', authorizeToken, RecruiterController.patchRecruiterData);
router.patch('/:id/status',authorizeToken, RecruiterController.updateRecruiterStatus)
router.get('/:id/status',authorizeToken, StatusHistoryController.getRecruiterStatusHistory)



module.exports = router;
