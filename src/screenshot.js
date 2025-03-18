// screenshot.js
const axios = require('axios');
const screenshot = require('screenshot-desktop');
const { getTelegramChatId, getScreenshotPrompt } = require('./telegram');

/**
 * Делает скриншот и отправляет его на сервер.
 */
async function sendScreenshot() {
  try {
    const chatId = getTelegramChatId();
    if (!chatId) {
      console.warn('❗ TELEGRAM_CHAT_ID не задан. Скриншот не отправляем.');
      return;
    }

    // Пользовательский промпт или дефолт
    const userMessage = getScreenshotPrompt() || 'Что на этом изображении?';

    const buffer = await screenshot({ format: 'png' });
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    await axios.post(
      'https://a7e2-94-131-21-129.ngrok-free.app/api/imagebot/external/image-process',
      {
        chatId,
        base64Image,
        userMessage,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('✅ Скриншот отправлен на сервер.');
  } catch (error) {
    console.error('❌ Ошибка при отправке скриншота:', error.message);
  }
}

module.exports = { sendScreenshot };


