//src/routes/recruitersRoutes.js
const express = require('express');
const router = express.Router();
const RecruiterController = require('../controllers/recruitersController');
const StatusHistoryController = require('../controllers/statusHistoryController');
const authorizeToken = require('../middleware/authorizeToken');
const RecruiterRoutesValidation = require('../middleware/validators/recruiterRoutesValidation');
const handleValidationErrors = require('../middleware/errorHandlers/validationErrorHandler');



router.post('/', authorizeToken, RecruiterRoutesValidation.validateCreateRecruiter(), handleValidationErrors, RecruiterController.createRecruiter);
router.get('/', authorizeToken, RecruiterController.getRecruiters);
router.get('/:id', authorizeToken, RecruiterController.getRecruiter);
router.delete('/:id', authorizeToken, RecruiterController.deleteRecruiter);
router.patch('/:id', authorizeToken, RecruiterRoutesValidation.validateUpdateRecruiter(), handleValidationErrors, RecruiterController.patchRecruiterData);
router.patch('/:id/status',authorizeToken, RecruiterRoutesValidation.validateUpdateRecruiterStatus(), handleValidationErrors, RecruiterController.updateRecruiterStatus);
router.get('/:id/status',authorizeToken, StatusHistoryController.getRecruiterStatusHistory);
router.get('/:id/with-history', authorizeToken, RecruiterController.getRecruiterWithHistory);



module.exports = router;
