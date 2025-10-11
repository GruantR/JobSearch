const StatusHistoryService = require('../../src/services/statusHistoryService');

describe('Полиморфная система истории', () => {
  
  test('Создание записи истории', async () => {
    // Правильное мокирование - функция возвращает промис
    const mockCreate = jest.fn().mockResolvedValue({
      id: 1,
      entityType: 'recruiter',
      entityId: 1,
      oldStatus: 'contacting',
      newStatus: 'waiting',
      notes: 'Тестовое сообщение',
      changedAt: new Date()
    });
    
    // Подменяем метод create модели StatusHistory
    const { StatusHistory } = require('../../src/models/index').models;
    StatusHistory.create = mockCreate;
    
    const result = await StatusHistoryService.addStatusChange(
      'recruiter', 1, 'contacting', 'waiting', 'Тестовое сообщение'
    );
    
    // Проверяем что create был вызван с правильными параметрами
    expect(mockCreate).toHaveBeenCalledWith({
      entityType: 'recruiter',
      entityId: 1,
      oldStatus: 'contacting',
      newStatus: 'waiting',
      notes: 'Тестовое сообщение'
    });
    
    // Проверяем что вернулись ожидаемые данные
    expect(result.entityType).toBe('recruiter');
    expect(result.entityId).toBe(1);
    expect(result.oldStatus).toBe('contacting');
    expect(result.newStatus).toBe('waiting');
  });

  test('Получение истории для сущности', async () => {
    const mockFindAll = jest.fn().mockResolvedValue([
      {
        entityType: 'recruiter',
        entityId: 1,
        oldStatus: 'contacting',
        newStatus: 'waiting',
        notes: 'Первое сообщение',
        changedAt: new Date('2023-01-01')
      },
      {
        entityType: 'recruiter', 
        entityId: 1,
        oldStatus: 'waiting',
        newStatus: 'in_process',
        notes: 'Начали общение',
        changedAt: new Date('2023-01-02')
      }
    ]);

    const { StatusHistory } = require('../../src/models/index').models;
    StatusHistory.findAll = mockFindAll;
    
    const history = await StatusHistoryService.getStatusHistory('recruiter', 1);
    
    expect(mockFindAll).toHaveBeenCalledWith({
      where: { entityType: 'recruiter', entityId: 1 },
      order: [['changedAt', 'DESC']]
    });
    
    expect(Array.isArray(history)).toBe(true);
    expect(history).toHaveLength(2);
    expect(history[0].newStatus).toBe('waiting');
    expect(history[1].newStatus).toBe('in_process');
  });
});