//src/services/userProfileController.js
const {models} = require('../models/index');
const {UserProfile} = models;

class UserProfileService {
    async createUserProfile (info) {
        const userProfile = await UserProfile.create(info);
        return userProfile
    };

    async getUserProfile () {

    };

    async updateUserProfile () {

    };
};

module.exports = new UserProfileService ();
