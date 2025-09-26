const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/usersControllers')

router.post('/register', UsersControllers.createUser);
router.get('/', UsersControllers.getUsers);
router.post('/login', UsersControllers.loginUser);


module.exports = router;