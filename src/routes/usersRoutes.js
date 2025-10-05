// src/routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/usersControllers')
const authorizeToken = require('../middleware/authorizeToken')

router.get('/all', authorizeToken, UsersControllers.getUsers);
router.get('/me',authorizeToken, UsersControllers.getCurrentUser);
router.patch('/me',authorizeToken, UsersControllers.updateDataCurrentUser);
router.delete('/me', authorizeToken, UsersControllers.deleteCurrentUser)

module.exports = router;