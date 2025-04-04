const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('../internal/axiosInstance');
const { getTelegramChatId, getAudioPrompt, getGptModel } = require('./telegram');
const { ipcMain } = require('electron');

const audioFilePath = path.join('/tmp', 'recorded_audio.wav');
let recordingProcess = null;

// 🛠 Путь к локальному sox
const isMac = process.platform === 'darwin';
const localSoxPath = isMac
  ? path.join(__dirname, '../resources/sox/sox')
  : 'sox'; // fallback на системный sox

// 🎙️ Начинаем запись аудио через SoX
async function startRecording() {
  return new Promise((resolve) => {
    console.log('🎙 Начинаем запись через SoX...');
    recordingProcess = exec(`${localSoxPath} -d -r 16000 -c 1 ${audioFilePath}`, (error) => {
      if (error) {
        console.error('❌ Ошибка записи через SoX:', error);
        ipcMain.emit('log-message', null, {
          type: 'error',
          message: `Ошибка при записи аудио: ${error.message}`,
        });
      }
    });
    resolve();
  });
}

// 🛑 Останавливаем запись и отправляем файл на сервер
async function stopRecording() {
  return new Promise((resolve, reject) => {
    console.log('🛑 Останавливаем запись...');

    if (!recordingProcess) {
      const msg = 'Запись не начата.';
      console.error('❌', msg);
      ipcMain.emit('log-message', null, { type: 'error', message: msg });
      return reject(msg);
    }

    recordingProcess.kill();
    recordingProcess = null;

    setTimeout(async () => {
      if (!fs.existsSync(audioFilePath)) {
        const msg = 'Файл записи не найден.';
        console.error('❌', msg);
        ipcMain.emit('log-message', null, { type: 'error', message: msg });
        return reject(msg);
      }

      const success = await sendAudioToServer(audioFilePath);

      if (success) {
        ipcMain.emit('log-message', null, {
          type: 'info',
          message: 'Аудио успешно отправлено на сервер.',
        });
      }

      //  Удаляем файл в любом случае (успешно отправилось или нет)
      try {
        fs.unlinkSync(audioFilePath);
        console.log('🧹 Временный аудиофайл удалён:', audioFilePath);
      } catch (err) {
        console.warn('⚠️ Не удалось удалить аудиофайл:', err.message);
      }
      resolve();
    }, 1000);
  });
}

// 📤 Отправляет записанный аудиофайл на сервер в формате Base64
async function sendAudioToServer(filePath) {
  try {
    const chatId = getTelegramChatId();
    const audioPrompt = getAudioPrompt();
    const gptModel = getGptModel() || 'gpt-mini';

    if (!chatId) {
      ipcMain.emit('log-message', null, {
        type: 'error',
        message: 'TELEGRAM_CHAT_ID не задан. Аудио не отправлено.',
      });
      return false;
    }

    const audioBuffer = fs.readFileSync(filePath);
    const base64Audio = audioBuffer.toString('base64');

    // Определяем endpoint в зависимости от выбранной модели
    let endpoint = '/api/audiobot/process-audio';
    if (gptModel === 'GPT-o3-mini') endpoint = '/api/audiobot/process-audio-GPT-o3-mini';
    if (gptModel === 'GPT-4o-mini') endpoint = '/api/audiobot/process-audio-GPT-4o-mini';
    if (gptModel === 'GPT-o1') endpoint = '/api/audiobot/process-audio-GPT-o1';

    await axios.post(endpoint, {
      chatId,
      base64Audio,
      userPrompt: audioPrompt,
    });

    return true;
  } catch (error) {
    console.error('❌ Ошибка при отправке аудио на сервер:', error.message);
    ipcMain.emit('log-message', null, {
      type: 'error',
      message: `Ошибка при отправке аудио: ${error.message}`,
    });
    return false;
  }
}

module.exports = { startRecording, stopRecording };













/* const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('../internal/axiosInstance'); 
const { getTelegramChatId, getAudioPrompt } = require('./telegram');
const { ipcMain } = require('electron');

const audioFilePath = path.join('/tmp', 'recorded_audio.wav');
let recordingProcess = null;

// 🎙️ Начинаем запись аудио через SoX
async function startRecording() {
  return new Promise((resolve) => {
    recordingProcess = exec(`sox -d -r 16000 -c 1 ${audioFilePath}`, (error) => {
      if (error) {
        console.error('❌ Ошибка записи через SoX:', error);
        ipcMain.emit('log-message', null, {
          type: 'error',
          message: `Ошибка при записи аудио: ${error.message}`,
        });
      }
    });
    resolve();
  });
}

// 🛑 Останавливаем запись и отправляем файл на сервер
async function stopRecording() {
  return new Promise((resolve, reject) => {
    if (!recordingProcess) {
      const msg = 'Запись не начата.';
      console.error('❌ Ошибка:', msg);
      ipcMain.emit('log-message', null, { type: 'error', message: msg });
      return reject(msg);
    }

    recordingProcess.kill();
    recordingProcess = null;

    setTimeout(async () => {
      if (!fs.existsSync(audioFilePath)) {
        const msg = 'Файл записи не найден.';
        console.error('❌', msg);
        ipcMain.emit('log-message', null, { type: 'error', message: msg });
        return reject(msg);
      }

      const success = await sendAudioToServer(audioFilePath);
      if (success) {
        ipcMain.emit('log-message', null, {
          type: 'info',
          message: 'Аудио успешно отправлено на сервер.',
        });
      }
      resolve();
    }, 1000);
  });
}

// 📤 Отправляет записанный аудиофайл на сервер в формате Base64
async function sendAudioToServer(filePath) {
  try {
    const chatId = getTelegramChatId();
    const audioPrompt = getAudioPrompt();

    if (!chatId) {
      ipcMain.emit('log-message', null, {
        type: 'error',
        message: 'TELEGRAM_CHAT_ID не задан. Аудио не отправлено.',
      });
      return false;
    }

    const audioBuffer = fs.readFileSync(filePath);
    const base64Audio = audioBuffer.toString('base64');

    //  отправляем через  axiosInstance
    await axios.post('/api/audiobot/process-audio', {
      chatId,
      base64Audio,
      userPrompt: audioPrompt,
    });

    return true;
  } catch (error) {
    console.error('❌ Ошибка при отправке аудио на сервер:', error.message);
    ipcMain.emit('log-message', null, {
      type: 'error',
      message: `Ошибка при отправке аудио: ${error.message}`,
    });
    return false;
  }
}

module.exports = { startRecording, stopRecording };


*/







/* const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const { getTelegramChatId, getAudioPrompt } = require('./telegram');
const { ipcMain } = require('electron');

const audioFilePath = path.join('/tmp', 'recorded_audio.wav');
let recordingProcess = null;

// Начинаем запись аудио через SoX
 
async function startRecording() {
  return new Promise((resolve) => {
    recordingProcess = exec(`sox -d -r 16000 -c 1 ${audioFilePath}`, (error) => {
      if (error) {
        console.error('❌ Ошибка записи через SoX:', error);
        ipcMain.emit('log-message', null, {
          type: 'error',
          message: `Ошибка при записи аудио: ${error.message}`,
        });
      }
    });
    resolve();
  });
}

// Останавливаем запись и отправляем файл на сервер
 
async function stopRecording() {
  return new Promise((resolve, reject) => {
    if (!recordingProcess) {
      const msg = 'Запись не начата.';
      console.error('❌ Ошибка:', msg);
      ipcMain.emit('log-message', null, { type: 'error', message: msg });
      return reject(msg);
    }

    recordingProcess.kill();
    recordingProcess = null;

    setTimeout(async () => {
      if (!fs.existsSync(audioFilePath)) {
        const msg = 'Файл записи не найден.';
        console.error('❌', msg);
        ipcMain.emit('log-message', null, { type: 'error', message: msg });
        return reject(msg);
      }

      const success = await sendAudioToServer(audioFilePath);
      if (success) {
        ipcMain.emit('log-message', null, {
          type: 'info',
          message: 'Аудио успешно отправлено на сервер.',
        });
      }
      resolve();
    }, 1000);
  });
}

// Отправляет записанный аудиофайл на сервер в формате Base64
 
async function sendAudioToServer(filePath) {
  try {
    const chatId = getTelegramChatId();
    const audioPrompt = getAudioPrompt();

    if (!chatId) {
      ipcMain.emit('log-message', null, {
        type: 'error',
        message: 'TELEGRAM_CHAT_ID не задан. Аудио не отправлено.',
      });
      return false;
    }

    const audioBuffer = fs.readFileSync(filePath);
    const base64Audio = audioBuffer.toString('base64');

    const apiUrl = 'https://4630-94-131-21-129.ngrok-free.app/api/audiobot/process-audio';

    await axios.post(apiUrl, {
      chatId,
      base64Audio,
      userPrompt: audioPrompt,
    });

    return true;
  } catch (error) {
    console.error('❌ Ошибка при отправке аудио на сервер:', error.message);
    ipcMain.emit('log-message', null, {
      type: 'error',
      message: `Ошибка при отправке аудио: ${error.message}`,
    });
    return false;
  }
}

module.exports = { startRecording, stopRecording };

*/



//const apiUrl = 'https://eaa5-94-131-21-129.ngrok-free.app//api/audiobot/process-audio';