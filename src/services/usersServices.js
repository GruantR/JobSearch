// usersServices.js
const { models } = require('../models/index');
const { User } = models;



class UsersServices {
async createUser (info) {
    const newUser = await User.create(info);
    return newUser;
};

async getUsers () {
    const users = await User.findAll({});
    return users;
}

};

module.exports = new UsersServices();