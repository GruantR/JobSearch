//usersControllers.js
const usersServices = require('../services/usersServices');

class UsersControllers {

    async createUser(req, res, next) {
        try { 
            const createdUser = await usersServices.createUser(req.body)
            res.send(createdUser)

        } catch (err) {
            next(err);
        };
    };

    async getUsers(req, res, next) {
        try {
            const result = await usersServices.getUsers()
            res.send(result);
        } catch (err) {
            next(err);
        };
    };

    async loginUser (req, res, next) {
        try{
            const { email, password } = req.body;         
            const token = await usersServices.validatePassword(email, password);
            res.json({ token });
        } catch (error) {
             
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ error: 'Неверный логин или паролик' });
        }
        res.status(500).json({ error: 'Internal server error' });
        }
    }

};

module.exports = new UsersControllers();