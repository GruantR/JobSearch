// src/routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/usersControllers')
const authorizeToken = require('../middleware/authorizeToken')
const UsersRoutesValidation = require('../middleware/validators/usersRoutesValidation');
const handleValidationErrors = require('../middleware/errorHandlers/validationErrorHandler');

router.post('/register', UsersRoutesValidation.validateDataRegisterUser(), handleValidationErrors,  UsersControllers.createUser);
router.post('/login', UsersRoutesValidation.validateDataLoginUser(), handleValidationErrors, UsersControllers.loginUser);
router.get('/', authorizeToken, UsersControllers.getUsers);
router.get('/:id',authorizeToken, UsersControllers.getCurrentUser);
router.patch('/:id',authorizeToken, UsersControllers.updateDataCurrentUser);
router.delete('/:id', authorizeToken, UsersControllers.deleteCurrentUser)



module.exports = router;