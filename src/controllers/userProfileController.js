const UserProfileService = require('../services/UserProfileService');

class UserProfileController {
async createProfileUser (req,res,next) {
    try {

        const userProfile = await UserProfileService.createUserProfile(req.body);
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