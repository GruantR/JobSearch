//src/controllers/userProfileController.js
const UserProfileService = require('../services/userProfileService');

class UserProfileController {
async createProfileUser (req,res,next) {
    try {
        const profileData = {
            ...req.body,
            userId: req.userId // берем из токена
        };
        const userProfile = await UserProfileService.createUserProfile(profileData);
        res.status(201).json({
            success: true,
            message: 'Профиль пользователя успешно создан',
            data: {userProfile}
        })

    }catch(err) {
next(err)
    }
}
}
module.exports = new UserProfileController();