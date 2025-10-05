//src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authRoutesValidation = require('../middleware/validators/authRoutesValidation');
const handleValidationErrors = require('../middleware/errorHandlers/validationErrorHandler');

router.post('/register', authRoutesValidation.validateDataRegisterUser(), handleValidationErrors,  AuthController.createUser);
router.post('/login', authRoutesValidation.validateDataLoginUser(), handleValidationErrors, AuthController.loginUser);

module.exports = router;