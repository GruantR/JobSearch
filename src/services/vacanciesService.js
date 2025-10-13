//src/services/vacanciesService.js

const { models } = require("../models/index");
const { Vacancy, StatusHistory } = models;
const {
  NotFoundError,
  StatusValidationError,
} = require("../errors/customErrors");
const statusHistoryService = require("./statusHistoryService");

class VacanciesService {
  // Добавить константу с допустимыми статусами
  get validStatuses() {
    return [
      "found",
      "applied",
      "waiting",
      "interview",
      "offer",
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

  async createVacancy(info) {
    const vacancyData = { ...info, status: 'found', applicationDate: info.applicationDate || null };
    const vacancy = await Vacancy.create(vacancyData);
    return vacancy;
  }

  async getVacancies(userId) {
    const vacancies = await Vacancy.findAll({ where: { userId } });
    return vacancies;
  }

  async getVacancy(id, userId) {
    const vacancy = await Vacancy.findOne({ where: { id, userId } });
    if (!vacancy) {
      throw new NotFoundError("Вакансия не найдена");
    }
    return vacancy;
  }

  async deleteVacancy(id, userId) {
    const vacancy = await Vacancy.findOne({ where: { id, userId } });
    if (!vacancy) {
      throw new NotFoundError("Вакансия не найдена");
    }
    await vacancy.destroy();
    console.log(
      `✅ Вакансия удалена: ${vacancy.companyName} - ${vacancy.jobTitle} (ID: ${vacancy.id})`
    );
    return {
      id: vacancy.id,
      companyName: vacancy.companyName,
      jobTitle: vacancy.jobTitle,
    };
  }

  async patchVacancyData(id, userId, updateData) {
    if (updateData.status) {
      throw new StatusValidationError(
        "Для изменения статуса используйте специальный метод updateVacancyStatus"
      );
    }

    const vacancy = await Vacancy.findOne({ where: { id, userId } });
    if (!vacancy) {
      throw new NotFoundError("Вакансия не найдена");
    }
    const updateVacancy = await vacancy.update(updateData);
    return updateVacancy;
  }

  validateStatusTransition(oldStatus, newStatus) {
    if (oldStatus === newStatus) {
      return true;
    }

    this.validateStatus(oldStatus);
    this.validateStatus(newStatus);
    // Определяем разрешенные переходы
    const allowedTransitions = {
      found: ["applied", "waiting", "interview", "archived"],
      applied: ["waiting", "interview", "rejected", "archived"],
      waiting: ["interview", "offer", "rejected", "archived"],
      interview: ["waiting", "offer", "rejected", "archived"],
      offer: ["waiting", "rejected", "archived"],
      rejected: ["applied", "waiting", "archived"],
      archived: ["found", "applied", "waiting"],
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
      found: "Найдена вакансия 🔍",
      applied: "Откликнулся 📤",
      waiting: "В ожидании ответа ⏳",
      interview: "Собеседование 💼",
      offer: "Получен оффер 🎉",
      rejected: "Отказ ❌",
      archived: "В архиве 📁",
    };
    return descriptions[status] || status;
  }

  async updateVacancyStatus(vacancyId, userId, newStatus, notes = "") {
    const vacancy = await this.getVacancy(vacancyId, userId);
    const oldStatus = vacancy.status;

    this.validateStatusTransition(oldStatus, newStatus);
    const updateData = { status: newStatus };
    if (notes) {
      updateData.notes = notes;
    }
    if (newStatus === "applied") {
      updateData.applicationDate = new Date();
    }
    if (["waiting", "interview"].includes(newStatus)) {
      updateData.lastContactDate = new Date();
    }

    await vacancy.update(updateData);
    await statusHistoryService.addStatusChange(
      "vacancy",
      vacancyId,
      oldStatus,
      newStatus,
      notes
    );

    return vacancy;
  }

  async getVacancyWithHistory(id, userId) {
    const vacancy = await Vacancy.findOne({
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
    if (!vacancy) {
      throw new NotFoundError("Вакансия не найдена");
    }
    return vacancy;
  }
}

module.exports = new VacanciesService();
