//src/bot/handlers/userHandlers.js
const sessionManager = require('../services/sessionManager');
const UsersServices = require('../../services/usersService');
const UserProfileService = require('../../services/userProfilesService');
const { handleBotError } = require('../utils/errorHandler');

class userHandlers {
    async handleMeAndProfileComand(bot, msg) {
        const chatId = msg.chat.id;


        try {
            if (!sessionManager.isAuthenticated(chatId)) {
                bot.sendMessage(chatId, '❌ Сначала войдите в систему через /login');
                return;
            }
            const session = await sessionManager.getSession(chatId);
            const userData = await UsersServices.getUserById(session.user.id);
            
            const userProfile = UserProfileService.getUserProfile(session.user.id)
            bot.sendMessage(chatId, JSON.stringify(userData))


        } catch (error) {
            const message = handleBotError(error);
            bot.sendMessage(chatId, message);
        }
    }
}

module.exports = new userHandlers();