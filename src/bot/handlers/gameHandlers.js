const bot = require("../bot");

const randomGameNumber = {};
const keyboardGame = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "1", callback_data: "game_keyboard_1" },
        { text: "2", callback_data: "game_keyboard_2" },
        { text: "3", callback_data: "game_keyboard_3" }
      ],
      [
        { text: "4", callback_data: "game_keyboard_4" },
        { text: "5", callback_data: "game_keyboard_5" },
        { text: "6", callback_data: "game_keyboard_6" }
      ],
      [
        { text: "7", callback_data: "game_keyboard_7" },
        { text: "8", callback_data: "game_keyboard_8" },
        { text: "9", callback_data: "game_keyboard_9" }
      ],
      [{ text: "0", callback_data: "game_keyboard_0" }]
    ]
  }
};

const againGame = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "🎮 Начать заново", callback_data: "again_game" }]
    ]
  }
};

async function newGame(chatId) {
  await bot.sendMessage(chatId, '🎮 Я загадал цифру от 0 до 9, попробуй отгадать!');
  const randomNumber = Math.floor(Math.random() * 10);
  randomGameNumber[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Выбери число:', keyboardGame);
}

module.exports = { newGame, againGame, randomGameNumber };