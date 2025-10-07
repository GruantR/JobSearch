//src/services/userProfileService.js
const { models } = require("../models/index");
const { UserProfile } = models;
const { ConflictError, NotFoundError } = require("../errors/customErrors");

class UserProfileService {

  async getUserProfile(userId) {
    const userProfile = await UserProfile.findOne({ where: { userId } });
    if (!userProfile) {
        throw new NotFoundError("Профиль пользователя не найден");
    }
    return userProfile;
  }

  async updateUserProfile(info, userId) {
    const userProfile = await UserProfile.findOne({ where: { userId } });
    if (!userProfile) {
        throw new NotFoundError("Профиль пользователя не найден");
    }
    await userProfile.update(info);
    return userProfile;
  }
}

module.exports = new UserProfileService();
