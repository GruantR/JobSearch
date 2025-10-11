//src/services/recruitersServices.js
const { models } = require("../models/index");
const { Recruiter, StatusHistory } = models;
const {
  NotFoundError,
  StatusValidationError,
} = require("../errors/customErrors");
const statusHistoryService = require("./statusHistoryService");

class RecruiterService {
  async createRecruiter(info) {
    const recruiter = await Recruiter.create(info);
    return recruiter;
  }

  async getRecruiters(userId) {
    const recruiters = await Recruiter.findAll({ where: { userId } });
    return recruiters;
  }

  async getRecruiter(id, userId) {
    const recruiter = await Recruiter.findOne({ where: { id, userId } });
    if (!recruiter) {
      throw new NotFoundError("Рекрутер не найден");
    }
    return recruiter;
  }

  async deleteRecruiter(id, userId) {
    const recruiter = await Recruiter.findOne({ where: { id, userId } });
    if (!recruiter) {
      throw new NotFoundError("Рекрутер не найден");
    }
    await recruiter.destroy();
    console.log(`рекрутер ${recruiter.fullName} (ID: ${recruiter.id}) удален`);
    return {
      id: recruiter.id,
      fullName: recruiter.fullName,
    };
  }

  async patchRecruiterData(id, userId, updateData) {
    const recruiter = await Recruiter.findOne({ where: { id, userId } });
    if (!recruiter) {
      throw new NotFoundError("Рекрутер не найден");
    }
    const updateRecruiter = await recruiter.update(updateData);
    return updateRecruiter;
  }

   validateStatusTransition(oldStatus, newStatus) {
    if (oldStatus === newStatus) {
        return true;
      }
    // Определяем разрешенные переходы
    const allowedTransitions = {
      contacting: ["waiting", "in_process", "rejected", "archived"],
      waiting: ["in_process", "rejected", "archived", "contacting"],
      in_process: ["waiting", "got_offer", "rejected", "archived"],
      got_offer: ["archived"],
      rejected: ["archived"],
      archived: ["contacting"], // можно вернуть из архива
    };
    // Если это первый статус (oldStatus null) - разрешаем
    if (!oldStatus) return true;
    // Проверяем разрешен ли переход
    const allowedNextStatuses = allowedTransitions[oldStatus];
    if (!allowedNextStatuses) {
      throw new StatusValidationError(
        `Неизвестный текущий статус: ${oldStatus}`
      );
    }
    if (!allowedNextStatuses.includes(newStatus)) {
      throw new StatusValidationError(
        `Нельзя перейти из статуса "${oldStatus}" в "${newStatus}".\n` +
          `Разрешенные переходы: ${allowedNextStatuses.join(", ")}`
      );
    }
    return true;
  }

  // Добавим метод с описаниями статусов
getStatusDescription(status) {
    const descriptions = {
      contacting: "Установление контакта 📞",
      waiting: "Ожидание ответа ⏳", 
      in_process: "Активное общение 💬",
      got_offer: "Получен оффер 🎉",
      rejected: "Отказ ❌",
      archived: "В архиве 📁"
    };
    return descriptions[status] || status;
  }

  async updateRecruiterStatus(recruiterId, userId, newStatus, notes = "") {
    const recruiter = await this.getRecruiter(recruiterId, userId);
    const oldStatus = recruiter.status;

    // ВАЛИДАЦИЯ ПЕРЕХОДА
    this.validateStatusTransition(oldStatus, newStatus);

    // Автоматические действия при смене статуса
    const updateData = { status: newStatus };

    // Авто-обновление даты контакта для активных статусов
    if (["in_process", "waiting"].includes(newStatus)) {
      updateData.lastContactDate = new Date();
    }

    await recruiter.update(updateData);
    await statusHistoryService.addStatusChange(
      "recruiter",
      recruiterId,
      oldStatus,
      newStatus,
      notes
    );
    return recruiter;
  }

  async getRecruiterWithHistory(id, userId) {
    const recruiter = await Recruiter.findOne({
      where: { id, userId },
      include: [
        {
          model: StatusHistory,
          as: "statusHistory",
          attributes: ["oldStatus", "newStatus", "notes", "changedAt"],
          order: [["changedAt", "DESC"]], // сначала новые записи
        },
      ],
    });

    if (!recruiter) {
      throw new NotFoundError("Рекрутер не найден");
    }

    return recruiter;
  }
}

module.exports = new RecruiterService();
