const express = require('express');
const router = express.Router();
const usersRoutes = require('./usersRoutes');

router.get('/', (req, res) => {
    res.json({
        message: 'Добро пожаловать в API!',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            health: '/api/health'
        }
    });
});


router.use('/users', usersRoutes);
module.exports = router;