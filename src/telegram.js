const axios = require('axios');
const { TELEGRAM_CHAT_ID } = require('./config');

/**
 * Отправляет скриншот (буфер PNG) на сервер через API
 * @param {Buffer} imageBuffer
 */
async function sendScreenshot(imageBuffer) {
  try {
    // Конвертируем  в Base64
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    // Адрес API 
    const apiUrl = 'https://eaa5-94-131-21-129.ngrok-free.app/api/imagebot/external/image-process';

    //  отправка
    await axios.post(apiUrl, {
      chatId: TELEGRAM_CHAT_ID,
      base64Image,
      userMessage: 'что выведет console.log?',
    }, { headers: { 'Content-Type': 'application/json' } });

    console.log('✅ Скриншот успешно отправлен на сервер!');
  } catch (error) {
    console.error('❌ Ошибка при отправке скриншота на сервер:', error.message);
  }
}

module.exports = { sendScreenshot };
















