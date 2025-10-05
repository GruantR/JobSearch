//src/routes/index.js
const express = require('express');
const router = express.Router();
const usersRoutes = require('./usersRoutes');
const authRoutes = require('./authRoutes');

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

router.use('/auth', authRoutes); 
router.use('/users', usersRoutes);

module.exports = router;