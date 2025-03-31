// recorder.js
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const { getTelegramChatId, getAudioPrompt } = require('./telegram');

const audioFilePath = path.join('/tmp', 'recorded_audio.wav');
let recordingProcess = null;

/**
 * Начинаем запись аудио через SoX
 */
async function startRecording() {
  return new Promise((resolve) => {
    console.log('🎙 Начинаем запись через SoX...');

    recordingProcess = exec(`sox -d -r 16000 -c 1 ${audioFilePath}`, (error) => {
      if (error) {
        console.error('❌ Ошибка записи через SoX:', error);
      }
    });

    resolve();
  });
}

/**
 * Останавливаем запись и отправляем файл на сервер
 */
async function stopRecording() {
  return new Promise((resolve, reject) => {
    if (!recordingProcess) {
      console.error('❌ Ошибка: запись не начата.');
      return reject('Запись не начата.');
    }

    console.log('🛑 Останавливаем запись...');
    recordingProcess.kill(); // Останавливаем процесс SoX
    recordingProcess = null;

    setTimeout(async () => {
      if (!fs.existsSync(audioFilePath)) {
        console.error('❌ Файл не найден:', audioFilePath);
        return reject('Файл записи не найден.');
      }

      console.log(`📏 Размер файла: ${fs.statSync(audioFilePath).size} байт`);
      console.log('📤 Отправляем аудио на сервер...');

      await sendAudioToServer(audioFilePath);
      resolve();
    }, 1000);
  });
}

/**
 * Отправляет записанный аудиофайл на сервер в формате Base64
 */
async function sendAudioToServer(filePath) {
  try {
    const chatId = getTelegramChatId();
    const audioPrompt = getAudioPrompt();

    if (!chatId) {
      console.warn('❗ TELEGRAM_CHAT_ID не задан. Аудио не отправляем.');
      return;
    }

    const audioBuffer = fs.readFileSync(filePath);
    const base64Audio = audioBuffer.toString('base64');

    const apiUrl = 'https://4630-94-131-21-129.ngrok-free.app/api/audiobot/process-audio';

    const response = await axios.post(apiUrl, {
      chatId,
      base64Audio,
      userPrompt: audioPrompt,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
  //console.log('✅ Аудио успешно отправлено на сервер:', response.data);
  } catch (error) {
    console.error('❌ Ошибка при отправке аудио на сервер:', error);
  }
}

module.exports = { startRecording, stopRecording };


//const apiUrl = 'https://eaa5-94-131-21-129.ngrok-free.app//api/audiobot/process-audio';