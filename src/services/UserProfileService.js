const {models} = require('../models/index');
const {User_profile} = models;

class UserProfileService {
    async createUserProfile (info) {
        const userProfile = await User_profile.create(info);
        return userProfile
    };

    async getUserProfile () {

    };

    async updateUserProfile () {

    };
};

module.exports = new UserProfileService ();
