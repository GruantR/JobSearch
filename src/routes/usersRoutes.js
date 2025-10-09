// src/routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/usersController');
const UserProfileController = require('../controllers/userProfilesController');
const authorizeToken = require('../middleware/authorizeToken');
const UserRoutesValidation = require('../middleware/validators/userRoutesValidation');
const handleValidationErrors = require('../middleware/errorHandlers/validationErrorHandler');

router.get('/all', authorizeToken, UsersControllers.getUsers);
router.get('/me',authorizeToken, UsersControllers.getCurrentUser);
router.patch('/me', authorizeToken, UserRoutesValidation.validateDataUpdateUser(), handleValidationErrors, UsersControllers.updateDataCurrentUser);
router.delete('/me', authorizeToken, UsersControllers.deleteCurrentUser);

router.get('/profile',authorizeToken, UserProfileController.getDataProfileUser);
router.patch('/profile', authorizeToken, UserRoutesValidation.validateDataUpdateUserProfile(), handleValidationErrors, UserProfileController.patchDataProfileUser);


module.exports = router;