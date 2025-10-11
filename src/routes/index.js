//src/routes/index.js
const express = require('express');
const router = express.Router();
const usersRoutes = require('./usersRoutes');
const authRoutes = require('./authRoutes');
const recruitersRoutes = require('./recruitersRoutes');
const analyticsRouter = require('./analyticsRoutes');

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
router.use('/recruiters', recruitersRoutes);
router.use('/analytics', analyticsRouter)


module.exports = router;