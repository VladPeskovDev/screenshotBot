/* const axios = require('axios');
const screenshot = require('screenshot-desktop');
const { getTelegramChatId, getScreenshotPrompt } = require('./telegram');
const { ipcMain } = require('electron');

// Делает скриншот и отправляет его на сервер.
 
async function sendScreenshot() {
  try {
    const chatId = getTelegramChatId();
    if (!chatId) {
      console.warn('❗ TELEGRAM_CHAT_ID не задан. Скриншот не отправляем.');
      ipcMain.emit('log-message', null, {
        type: 'error',
        message: 'TELEGRAM_CHAT_ID не задан. Скриншот не отправлен.',
      });
      return;
    }

    const userMessage = getScreenshotPrompt();

    const buffer = await screenshot({ format: 'png' });
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    await axios.post(
      'https://4630-94-131-21-129.ngrok-free.app/api/imagebot/external/image-process',
      {
        chatId,
        base64Image,
        userMessage,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('✅ Скриншот отправлен на сервер.');
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
*/ 

const screenshot = require('screenshot-desktop');
const { getTelegramChatId, getScreenshotPrompt } = require('./../telegram');
const { ipcMain } = require('electron');
const axios = require('./../internal/axiosInstance'); 

async function sendScreenshot() {
  try {
    const chatId = getTelegramChatId();
    if (!chatId) {
      console.warn('❗ TELEGRAM_CHAT_ID не задан. Скриншот не отправляем.');
      ipcMain.emit('log-message', null, {
        type: 'error',
        message: 'TELEGRAM_CHAT_ID не задан. Скриншот не отправлен.',
      });
      return;
    }

    const userMessage = getScreenshotPrompt();
    const buffer = await screenshot({ format: 'png' });
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    await axios.post('/api/imagebot/external/image-process', {
      chatId,
      base64Image,
      userMessage,
    });

    console.log('✅ Скриншот отправлен на сервер.');
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
