//src/services/recruitersServices.js
const logger = require("../utils/logger");
const { models } = require("../models/index");
const { Recruiter, StatusHistory } = models;
const {
  NotFoundError,
  StatusValidationError,
} = require("../errors/customErrors");
const statusHistoryService = require("./statusHistoryService");

class RecruiterService {
  // Добавим константу с допустимыми статусами
  get validStatuses() {
    return [
      "contacting",
      "waiting",
      "in_process",
      "got_offer",
      "rejected",
      "archived",
    ];
  }
  
  // Метод для валидации статуса
  validateStatus(status) {
    if (!this.validStatuses.includes(status)) {
      throw new StatusValidationError(
        `Недопустимый статус: "${status}". Допустимые статусы: ${this.validStatuses.join(
          ", "
        )}`
      );
    }
    return true;
  }

  async createRecruiter(info) {
    // Валидируем статус перед созданием
    const recruiterData = { ...info, status: 'contacting' };
    const recruiter = await Recruiter.create(recruiterData);
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
    logger.info(
      `✅ Рекрутер удален: ${recruiter.fullName} (ID: ${recruiter.id})`
    );
    return {
      id: recruiter.id,
      fullName: recruiter.fullName,
    };
  }

  async patchRecruiterData(id, userId, updateData) {
    if (updateData.status) {
      throw new StatusValidationError(
        "Для изменения статуса рекрутера используйте метод updateRecruiterStatus"
      );
    }

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

    this.validateStatus(oldStatus);
    this.validateStatus(newStatus);
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
      archived: "В архиве 📁",
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
    if (notes) {
      updateData.notes = notes;
    }

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
