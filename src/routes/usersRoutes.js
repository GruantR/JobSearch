const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/usersControllers')
const authorizeToken = require('../middleware/authorizeToken')

router.post('/register', UsersControllers.createUser);
router.get('/', authorizeToken, UsersControllers.getUsers);
router.post('/login', UsersControllers.loginUser);


module.exports = router;