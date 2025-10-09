//src/services/recruitersServices.js
const { models } = require("../models/index");
const { Recruiter } = models;
const { NotFoundError } = require("../errors/customErrors");
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

  async updateRecruiterStatus(recruiterId, userId, newStatus, notes = "") {    
    const recruiter = await this.getRecruiter(recruiterId, userId);
    const oldStatus = recruiter.status;

    await recruiter.update({ status: newStatus, lastContactDate: new Date() });
    await statusHistoryService.addStatusChange(
      "recruiter",
      recruiterId,
      oldStatus,
      newStatus,
      notes
    );
    return recruiter;
  }
}

module.exports = new RecruiterService();
