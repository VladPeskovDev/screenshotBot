const axios = require('axios');
const screenshot = require('screenshot-desktop');
const { TELEGRAM_CHAT_ID } = require('./config');

/**
 * Делает скриншот и отправляет его на сервер.
 */
async function sendScreenshot() {
  try {
    const buffer = await screenshot({ format: 'png' });
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;
    
    await axios.post('https://eaa5-94-131-21-129.ngrok-free.app/api/imagebot/external/image-process', {
      chatId: TELEGRAM_CHAT_ID,
      base64Image,
      userMessage: 'Что на этом изображении?',
    }, { headers: { 'Content-Type': 'application/json' } });

    console.log('✅ Скриншот отправлен на сервер.');
  } catch (error) {
    console.error('❌ Ошибка при отправке скриншота:', error.message);
  }
}

module.exports = { sendScreenshot };




