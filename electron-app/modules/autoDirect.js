const TelegramBot = require('node-telegram-bot-api');
const { getDirectChatId, getDirectToken } = require('./telegram');
const { takeScreenshotBuffer } = require('./screenshotDirect');

let intervalId = null;

/**
 * Запускает автоматическую отправку скриншотов каждые 20 секунд.
 */
function startAutoScreenshot(interval = 20000) {
  if (intervalId !== null) return; // уже работает

  const token = getDirectToken();
  const chatId = getDirectChatId();

  if (!token || !chatId) {
    console.error('❌ Не указан Telegram Token или Chat ID — автоскрин не будет запущен');
    return;
  }

  const bot = new TelegramBot(token, { polling: false });

  intervalId = setInterval(async () => {
    try {
      const buffer = await takeScreenshotBuffer();
      await bot.sendPhoto(chatId, buffer, { filename: 'screenshot.png' });
      //console.log('📸 Скриншот отправлен автоматически');
    } catch (error) {
      console.error('❌ Ошибка при автоскриншоте:', error.message);
    }
  }, interval);

  console.log('✅ Автоскриншоты запущены');
}

/**
 * Останавливает автоскриншоты.
 */
function stopAutoScreenshot() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('🛑 Автоскриншоты остановлены');
  }
}

/**
 * Проверяет, запущен ли режим автоскриншотов.
 */
function isAutoScreenshotRunning() {
  return intervalId !== null;
}

module.exports = {
  startAutoScreenshot,
  stopAutoScreenshot,
  isAutoScreenshotRunning,
};
