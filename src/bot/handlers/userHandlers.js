//src/bot/handlers/userHandlers.js
const sessionManager = require('../services/sessionManager');
const UsersServices = require('../../services/usersService');
const UserProfileService = require('../../services/userProfilesService');
const { handleBotError } = require('../utils/errorHandler');
const bot = require("../bot");

class userHandlers {
    async handleMeAndProfileComand(msg) {
        const chatId = msg.chat.id;
        try {
            if (!(await sessionManager.isAuthenticated(chatId))) {
                await bot.sendMessage(chatId, '❌ Сначала войдите в систему через /login');
                return;
            }
            const session = await sessionManager.getSession(chatId);
            const userData = await UsersServices.getUserById(session.user.id);
            const userProfile = await UserProfileService.getUserProfile(session.user.id)
            const message = this.formatUserInfo(userData,userProfile)
            
            await bot.sendMessage(chatId, message)


        } catch (error) {
            const message = handleBotError(error);
            await bot.sendMessage(chatId, message);
        }
    }

    formatUserInfo (user, profile){
        return `
        👤 **Ваш профиль**

        📧 Email: ${user.email}
        👨‍💼 Имя: ${profile.fullName || 'Не указано'}
        📞 Телефон: ${profile.phoneNumber || 'Не указано'}
        📅 Зарегистрирован: ${user.createdAt.toLocaleDateString('ru-RU')}
        `.trim();
    }
}

module.exports = new userHandlers();