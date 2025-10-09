//src/services/statusHistoryService.js
const { models } = require("../models/index");
const {StatusHistory} = models;

class StatusHistoryService {
    // Просто записываем изменение
    async addStatusChange(entityType, entityId, oldStatus, newStatus, notes = '') {
        return await StatusHistory.create({
            entityType,
            entityId, 
            oldStatus,
            newStatus,
            notes
        });
    }

    // Получаем историю для сущности
    async getStatusHistory(entityType, entityId) {
        return await StatusHistory.findAll({
            where: { entityType, entityId },
            order: [['changedAt', 'DESC']]
        });
    }
}

module.exports = new StatusHistoryService();