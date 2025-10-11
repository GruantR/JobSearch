// Подключаем сервис который будем тестировать
const RecruiterService = require('../../src/services/recruitersService');

//describe - группа тестов
describe('RecruiterService - Валидация статусов', ()=>{

// test - отдельный тест
test('Должен разрешать переход из contacting в waiting',()=>{
   
// expect - проверка утверждения
expect(()=>{
    RecruiterService.validateStatusTransition('contacting', 'waiting');
}).not.toThrow(); // "не должен бросать ошибку"
});

test('Должен запрещать переход из got_offer в contacting', () => {
    expect(() => {
      RecruiterService.validateStatusTransition('got_offer', 'contacting');
    }).toThrow(); // "должен бросать ошибку"
  });


  test('Должен возвращать описание статуса', () => {
    const description = RecruiterService.getStatusDescription('contacting');
    expect(description).toBe('Установление контакта 📞');
  });


}

)