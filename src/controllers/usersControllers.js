//usersControllers.js
const usersServices = require('../services/usersServices');

class UsersControllers {

    async createUser(req, res) {
        try {
            const createdUser = await usersServices.createUser(req.body)
            res.send (createdUser)

        } catch (err) {
            next(err); // Передаем ошибку в центральный обработчик
        };
    };

    async getUsers (req,res) {
        try{
            const result = await usersServices.getUsers()
            res.send(result);
        }catch(err){
            next(err); // Передаем ошибку в центральный обработчик
        };
    };

};

module.exports = new UsersControllers();