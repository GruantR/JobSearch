//src/controllers/userProfileController.js
const UserProfileService = require("../services/userProfileService");
const { BadRequestError } = require("../errors/customErrors");

class UserProfileController {

  async getDataProfileUser(req, res, next) {
    try {
      const userId = req.userId;
      const profileData = await UserProfileService.getUserProfile(userId);
      res.json({
        success: true,
        message: "Профиль пользователя",
        data: { profile: profileData },
      });
    } catch (err) {
      next(err);
    }
  }

  async patchDataProfileUser(req, res, next) {
    try{
      const userId = req.userId;
      const profileData = {};
      if (req.body.fullName) {
        const trimmedName = req.body.fullName.trim();
        if (trimmedName.length === 0) {
          throw new BadRequestError("ФИО не может быть пустым");
        }
        profileData.fullName = trimmedName;
      }
      if (req.body.phoneNumber) {
        const trimmedPhone = req.body.phoneNumber.trim();
        if (trimmedPhone.length === 0) {
          throw new BadRequestError("Номер телефона не может быть пустым");
        }
        profileData.phoneNumber = trimmedPhone;
      }
      if (Object.keys(profileData).length === 0) {
        throw new BadRequestError("Нет данных для обновления");
      }
      const updateProfile = await UserProfileService.updateUserProfile(profileData, userId);
      res.json({
        success: true,
        message: "данные профиля успешно обновлены",
        data: {profile: updateProfile}
      })
    }catch(err){
      next(err)
    }

  }
}
module.exports = new UserProfileController();
