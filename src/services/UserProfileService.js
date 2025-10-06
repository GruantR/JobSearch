//src/services/userProfileService.js
const { models } = require("../models/index");
const { UserProfile } = models;
const { ConflictError, NotFoundError } = require("../errors/customErrors");

class UserProfileService {

  async getUserProfile(userId) {
    const userProfile = await UserProfile.findOne({ where: { userId } });
    return userProfile;
  }

  async updateUserProfile(info, userId) {
    const userProfile = await UserProfile.findOne({ where: { userId } });
    await userProfile.update(info);
    return userProfile;
  }
}

module.exports = new UserProfileService();
