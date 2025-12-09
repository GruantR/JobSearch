const VacanciesService = require('../../src/services/vacanciesService');
const { StatusValidationError } = require('../../src/errors/customErrors');

jest.mock('../../src/services/statusHistoryService', () => ({
  addStatusChange: jest.fn().mockResolvedValue(),
}));

const statusHistoryService = require('../../src/services/statusHistoryService');

describe('VacanciesService - Статусы вакансии', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('validateStatus пропускает допустимые статусы', () => {
    VacanciesService.validStatuses.forEach((status) => {
      expect(() => VacanciesService.validateStatus(status)).not.toThrow();
    });
  });

  test('validateStatus выбрасывает ошибку для недопустимого статуса', () => {
    expect(() => VacanciesService.validateStatus('invalid')).toThrow(
      StatusValidationError
    );
  });

  test('validateStatusTransition разрешает переход found -> applied', () => {
    expect(() =>
      VacanciesService.validateStatusTransition('found', 'applied')
    ).not.toThrow();
  });

  test('validateStatusTransition запрещает переход found -> offer', () => {
    expect(() =>
      VacanciesService.validateStatusTransition('found', 'offer')
    ).toThrow(StatusValidationError);
  });

  test('updateVacancyStatus устанавливает applicationDate для applied и пишет историю', async () => {
    const vacancy = {
      id: 1,
      userId: 10,
      status: 'found',
      update: jest.fn(function (data) {
        Object.assign(this, data);
        return this;
      }),
    };

    jest.spyOn(VacanciesService, 'getVacancy').mockResolvedValue(vacancy);

    const result = await VacanciesService.updateVacancyStatus(
      1,
      10,
      'applied',
      'test notes'
    );

    expect(vacancy.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'applied',
        applicationDate: expect.any(Date),
      })
    );
    expect(statusHistoryService.addStatusChange).toHaveBeenCalledWith(
      'vacancy',
      1,
      'found',
      'applied',
      'test notes'
    );
    expect(result.status).toBe('applied');
    expect(result.applicationDate).toBeInstanceOf(Date);
  });

  test('updateVacancyStatus устанавливает lastContactDate для noResponse', async () => {
    const vacancy = {
      id: 2,
      userId: 10,
      status: 'applied',
      update: jest.fn(function (data) {
        Object.assign(this, data);
        return this;
      }),
    };

    jest.spyOn(VacanciesService, 'getVacancy').mockResolvedValue(vacancy);

    const result = await VacanciesService.updateVacancyStatus(
      2,
      10,
      'noResponse'
    );

    expect(vacancy.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'noResponse',
        lastContactDate: expect.any(Date),
      })
    );
    expect(statusHistoryService.addStatusChange).toHaveBeenCalledWith(
      'vacancy',
      2,
      'applied',
      'noResponse',
      ''
    );
    expect(result.lastContactDate).toBeInstanceOf(Date);
  });

  test('updateVacancyStatus выбрасывает ошибку для недопустимого статуса', async () => {
    const vacancy = {
      id: 3,
      userId: 10,
      status: 'found',
      update: jest.fn(),
    };

    jest.spyOn(VacanciesService, 'getVacancy').mockResolvedValue(vacancy);

    await expect(
      VacanciesService.updateVacancyStatus(3, 10, 'bad_status')
    ).rejects.toThrow(StatusValidationError);
    expect(vacancy.update).not.toHaveBeenCalled();
    expect(statusHistoryService.addStatusChange).not.toHaveBeenCalled();
  });
});

