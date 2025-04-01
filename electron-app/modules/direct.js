const TelegramBot = require('node-telegram-bot-api');
const { getDirectChatId, getDirectToken } = require('./telegram');
const { takeScreenshotBuffer } = require('./screenshotDirect');

// Делает скриншот и отправляет напрямую в указанный Telegram-чат.
 
async function sendDirectScreenshot() {
  const token = getDirectToken();
  const chatId = getDirectChatId();

  if (!token || !chatId) {
    console.error('❌ Не указан Telegram Token или Chat ID для прямой отправки');
    return;
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const buffer = await takeScreenshotBuffer();
    await bot.sendPhoto(chatId, buffer, {
        filename: 'screenshot.png', 
      });
    //console.log('✅ Скриншот успешно отправлен через Telegram напрямую');
  } catch (error) {
    console.error('❌ Ошибка при отправке скриншота:', error.message);
  }
}

module.exports = {
  sendDirectScreenshot,
};
