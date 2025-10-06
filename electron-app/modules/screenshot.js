const screenshot = require('screenshot-desktop');
const axios = require('../internal/axiosInstance');
const { getTelegramChatId, getScreenshotPrompt, getGptModel } = require('./telegram');
const { ipcMain } = require('electron');
const { sendOverlayText } = require('../utils/overlayMessenger');
const { recognizeTextFromBuffer } = require('../utils/ocr'); 

async function sendScreenshot() {
  try {
    const chatId = getTelegramChatId();
    const userMessage = getScreenshotPrompt();
    const gptModel = getGptModel() || 'GPT-4о';

    if (!chatId) {
      ipcMain.emit('log-message', null, {
        type: 'error',
        message: 'TELEGRAM_CHAT_ID не задан. Скриншот не отправлен.',
      });
      return;
    }

    // Снимок экрана
    const buffer = await screenshot({ format: 'png' });

    // Распознавание текста локально
    const ocrText = await recognizeTextFromBuffer(buffer);

    // Подготовка JSON-полезной нагрузки
    const payload = {
      chatId,
      userPrompt: userMessage,
      ocrText,
    };

    // Выбор endpoint по модели
    let endpoint = '/api/imagebot/external/image-process';
    if (gptModel === 'GPT-o3-mini') endpoint = '/api/imagebot/external/image-process-GPT-o3-mini';
    if (gptModel === 'GPT-4o-mini') endpoint = '/api/imagebot/external/image-process-GPT-4o-mini';
    if (gptModel === 'GPT-o1') endpoint = '/api/imagebot/external/image-process-GPT-o1';

    const response = await axios.post(endpoint, payload); // JSON, не FormData

    ipcMain.emit('log-message', null, {
      type: 'info',
      message: 'Скриншот успешно распознан и отправлен.',
    });

    const replyText = response.data?.reply?.trim();
    if (replyText) {
      sendOverlayText(replyText);
    }
  } catch (error) {
    console.error('❌ Ошибка при отправке скриншота:', error.message);
    ipcMain.emit('log-message', null, {
      type: 'error',
      message: `Ошибка при отправке скриншота: ${error.message}`,
    });
  }
}

module.exports = { sendScreenshot };
