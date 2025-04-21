const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('../internal/axiosInstance');
const { getTelegramChatId, getAudioPrompt, getGptModel } = require('./telegram');
const { ipcMain } = require('electron');
const FormData = require('form-data');
const ffmpegPath = require('ffmpeg-static'); 

const audioFilePath = path.join('/tmp', 'recorded_audio.wav');
let recordingProcess = null;
let recordingTimeout = null;

// 🎙️ Начинаем запись до 30 секунд
async function startRecording() {
  return new Promise((resolve) => {
    console.log('🎙 Начинаем запись через FFmpeg…');
    const cmd = `"${ffmpegPath}" -y -f avfoundation -i ":0" -ar 16000 -ac 1 -t 30 "${audioFilePath}"`;

    // Просто запускаем процесс без колбэка
    recordingProcess = exec(cmd);

    // Логируем только если ffmpeg не смог запуститься
    recordingProcess.on('error', (err) => {
      console.error('❌ Не удалось запустить FFmpeg:', err.message);
      ipcMain.emit('log-message', null, {
        type: 'error',
        message: `Ошибка при старте записи: ${err.message}`,
      });
    });

    resolve();
  });
}


// 🛑 Останавливаем запись и отправляем файл
async function stopRecording() {
  return new Promise((resolve, reject) => {
    console.log('🛑 Останавливаем запись...');
    if (!recordingProcess) {
      const msg = 'Запись не начата.';
      ipcMain.emit('log-message', null, { type: 'error', message: msg });
      return reject(msg);
    }

    recordingProcess.kill('SIGINT');
    recordingProcess = null;

    setTimeout(async () => {
      if (!fs.existsSync(audioFilePath)) {
        const msg = 'Файл записи не найден.';
        ipcMain.emit('log-message', null, { type: 'error', message: msg });
        return reject(msg);
      }

      const success = await sendAudioToServer(audioFilePath);
      ipcMain.emit('log-message', null, {
        type: success ? 'info' : 'error',
        message: success
          ? 'Аудио успешно отправлено на сервер.'
          : 'Не удалось отправить аудио на сервер.',
      });

      try {
        fs.unlinkSync(audioFilePath);
        console.log('🧹 Временный аудиофайл удалён:', audioFilePath);
      } catch (err) {
        console.warn('⚠️ Не удалось удалить аудиофайл:', err.message);
      }

      resolve();
    }, 500);
  });
}

// 📤 Отправляем файл на сервер
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

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('chatId', chatId);
    formData.append('userPrompt', audioPrompt || '');

    let endpoint = '/api/audiobot/process-audio';
    if (gptModel === 'GPT-o3-mini') endpoint = '/api/audiobot/process-audio-GPT-o3-mini';
    if (gptModel === 'GPT-4o-mini') endpoint = '/api/audiobot/process-audio-GPT-4o-mini';
    if (gptModel === 'GPT-o1') endpoint = '/api/audiobot/process-audio-GPT-o1';

    await axios.post(endpoint, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
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






//const apiUrl = 'https://eaa5-94-131-21-129.ngrok-free.app//api/audiobot/process-audio';