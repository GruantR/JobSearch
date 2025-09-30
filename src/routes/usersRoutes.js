// src/routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/usersControllers')
const authorizeToken = require('../middleware/authorizeToken')
const UsersRoutesValidation = require('../middleware/validators/usersRoutesValidation');
const handleValidationErrors = require('../middleware/errorHandlers/validationErrorHandler');

router.post('/register', UsersRoutesValidation.validateDataRegisterUser(), handleValidationErrors,  UsersControllers.createUser);
router.get('/', authorizeToken, UsersControllers.getUsers);
router.post('/login', UsersControllers.loginUser);


module.exports = router;