const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');
const axios = require('../internal/axiosInstance');
const { getTelegramChatId, getAudioPrompt, getGptModel } = require('./telegram');
const { ipcMain, app } = require('electron');
const FormData = require('form-data');

// Determine ffmpeg path and ensure unpacked
let ffmpegPath = require('ffmpeg-static');
if (app.isPackaged) {
  ffmpegPath = ffmpegPath.replace(`${path.sep}app.asar${path.sep}`, `${path.sep}app.asar.unpacked${path.sep}`);
}

const audioFilePath = path.join(os.tmpdir(), 'recorded_audio.wav');
let recordingProcess = null;

// 🎙️ Start recording (up to 30 seconds)
async function startRecording() {
  recordingProcess = exec(
    `"${ffmpegPath}" -y -f avfoundation -i ":0" -ar 16000 -ac 1 -t 55 "${audioFilePath}"`
  );
}

// 🛑 Stop recording and send file
async function stopRecording() {
  return new Promise((resolve) => {
    if (!recordingProcess) {
      return resolve();
    }
    recordingProcess.kill('SIGINT');
    recordingProcess = null;
    setTimeout(async () => {
      if (!fs.existsSync(audioFilePath)) {
        return resolve();
      }
      const success = await sendAudioToServer(audioFilePath);
      if (success) {
        ipcMain.emit('log-message', null, {
          type: 'info',
          message: 'Аудио успешно отправлено на сервер.',
        });
      }
      fs.unlink(audioFilePath, () => {});
      resolve();
    }, 2000);
  });
}

// 📤 Send file to server
async function sendAudioToServer(filePath) {
  try {
    const chatId = getTelegramChatId();
    const audioPrompt = getAudioPrompt();
    const gptModel = getGptModel() || 'gpt-mini';

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
  } catch {
    return false;
  }
}

module.exports = { startRecording, stopRecording };




//const apiUrl = 'https://eaa5-94-131-21-129.ngrok-free.app//api/audiobot/process-audio';