const screenshot = require('screenshot-desktop');
const FormData = require('form-data');
const axios = require('../internal/axiosInstance');
const { getTelegramChatId, getScreenshotPrompt, getGptModel } = require('./telegram');
const { ipcMain } = require('electron');

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

    const buffer = await screenshot({ format: 'png' });

    const form = new FormData();
    form.append('file', buffer, { filename: 'screenshot.png', contentType: 'image/png' });
    form.append('chatId', chatId);
    form.append('userPrompt', userMessage);

    let endpoint = '/api/imagebot/external/image-process';
    if (gptModel === 'GPT-o3-mini') endpoint = '/api/imagebot/external/image-process-GPT-o3-mini';
    if (gptModel === 'GPT-4o-mini') endpoint = '/api/imagebot/external/image-process-GPT-4o-mini';
    if (gptModel === 'GPT-o1') endpoint = '/api/imagebot/external/image-process-GPT-o1';

    await axios.post(endpoint, form, { headers: form.getHeaders() });

    ipcMain.emit('log-message', null, {
      type: 'info',
      message: 'Скриншот успешно отправлен.',
    });
  } catch (error) {
    console.error('❌ Ошибка при отправке скриншота:', error.message);
    ipcMain.emit('log-message', null, {
      type: 'error',
      message: `Ошибка при отправке скриншота: ${error.message}`,
    });
  }
}

module.exports = { sendScreenshot };
