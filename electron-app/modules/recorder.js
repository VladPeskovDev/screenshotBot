const fs = require("fs");
const os = require("os");
const path = require("path");
const { exec } = require("child_process");
const axios = require("../internal/axiosInstance");
const { getTelegramChatId, getAudioPrompt, getGptModel, getMicrophoneIndex,
} = require("./telegram");
const { ipcMain, app } = require("electron");
const FormData = require("form-data");

// Импортируем функцию, которая шлёт текст в overlay
const { sendOverlayText } = require("../utils/overlayMessenger");

// Determine ffmpeg path and ensure unpacked
let ffmpegPath = require("ffmpeg-static");
if (app.isPackaged) {
  ffmpegPath = ffmpegPath.replace(
    `${path.sep}app.asar${path.sep}`,
    `${path.sep}app.asar.unpacked${path.sep}`
  );
}

//const audioFilePath = path.join(os.tmpdir(), "recorded_audio.wav");
const audioFilePath = path.join(os.tmpdir(), "recorded_audio.flac");

let recordingProcess = null;

// 🎙️ Start recording (up to 55 seconds)
async function startRecording() {
  const microphoneIndex = getMicrophoneIndex() || ":0";
//формат flac
recordingProcess = exec(
  `"${ffmpegPath}" -y -f avfoundation -i "${microphoneIndex}" -ar 16000 -ac 1 -t 55 -c:a flac "${audioFilePath}"`
);
}

// 🛑 Stop recording and send file
async function stopRecording() {
  return new Promise((resolve) => {
    if (!recordingProcess) {
      return resolve();
    }
    recordingProcess.kill("SIGINT");
    recordingProcess = null;
    setTimeout(async () => {
      if (!fs.existsSync(audioFilePath)) {
        return resolve();
      }
      // Отправляем аудио и обрабатываем ответ:
      const reply = await sendAudioToServer(audioFilePath);
      if (reply) {
        // Лог в main-процессе и overlay
        ipcMain.emit("log-message", null, {
          type: "info",
          message: "Ответ получен и отправлен в overlay.",
        });
      } else {
        ipcMain.emit("log-message", null, {
          type: "error",
          message: "Не удалось получить ответ от сервера.",
        });
      }
      // Удаляем файл
      fs.unlink(audioFilePath, () => {});
      resolve();
    }, 2000);
  });
}

// 📤 Send file to server and return the botResponse
async function sendAudioToServer(filePath) {
    const chatId = getTelegramChatId();
    if (!chatId) {
    ipcMain.emit("log-message", null, {
      type: "error",
      message: "Сначала авторизуйтесь через Telegram!",
    });
    return null; // не отправляем ничего!
    }
  try {
    const audioPrompt = getAudioPrompt();
    const gptModel = getGptModel() || "GPT-o3-mini";

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("chatId", chatId);
    formData.append("userPrompt", audioPrompt || "");

    let endpoint = "/api/audiobot/process-audio";
    if (gptModel === "GPT-o3-mini")
      endpoint = "/api/audiobot/process-audio-GPT-o3-mini";
    if (gptModel === "GPT-4o-mini")
      endpoint = "/api/audiobot/process-audio-GPT-4o-mini";
    if (gptModel === "GPT-o1") endpoint = "/api/audiobot/process-audio-GPT-o1";

    // Выполняем POST и ждём ответа
    const response = await axios.post(endpoint, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    });

    const botResponse = response.data.reply;
    if (botResponse) {
      //console.log('[recorder] server reply:', botResponse);
      // Шлём текст в overlay
      sendOverlayText(botResponse);
      return botResponse;
    }
    return null;
  } catch (err) {
    console.error("[recorder] sendAudioToServer error:", err);
    return null;
  }
}

module.exports = { startRecording, stopRecording };







/* const fs = require("fs");
const os = require("os");
const path = require("path");
const { exec } = require("child_process");
const axios = require("../internal/axiosInstance");
const {
  getTelegramChatId,
  getAudioPrompt,
  getGptModel,
  getMicrophoneIndex,
} = require("./telegram");
const { ipcMain, app } = require("electron");
const FormData = require("form-data");

// Импортируем функцию, которая шлёт текст в overlay
const { sendOverlayText } = require("../utils/overlayMessenger");

// Determine ffmpeg path and ensure unpacked
let ffmpegPath = require("ffmpeg-static");
if (app.isPackaged) {
  ffmpegPath = ffmpegPath.replace(
    `${path.sep}app.asar${path.sep}`,
    `${path.sep}app.asar.unpacked${path.sep}`
  );
}

const audioFilePath = path.join(os.tmpdir(), "recorded_audio.wav");
let recordingProcess = null;

// 🎙️ Start recording (up to 55 seconds)
async function startRecording() {
  const microphoneIndex = getMicrophoneIndex() || ":0";
recordingProcess = exec(
  `"${ffmpegPath}" -y -f avfoundation -i "${microphoneIndex}" -ar 16000 -ac 1 -t 55 "${audioFilePath}"`
);
}

// 🛑 Stop recording and send file
async function stopRecording() {
  return new Promise((resolve) => {
    if (!recordingProcess) {
      return resolve();
    }
    recordingProcess.kill("SIGINT");
    recordingProcess = null;
    setTimeout(async () => {
      if (!fs.existsSync(audioFilePath)) {
        return resolve();
      }
      // Отправляем аудио и обрабатываем ответ:
      const reply = await sendAudioToServer(audioFilePath);
      if (reply) {
        // Лог в main-процессе и overlay
        ipcMain.emit("log-message", null, {
          type: "info",
          message: "Ответ получен и отправлен в overlay.",
        });
      } else {
        ipcMain.emit("log-message", null, {
          type: "error",
          message: "Не удалось получить ответ от сервера.",
        });
      }
      // Удаляем файл
      fs.unlink(audioFilePath, () => {});
      resolve();
    }, 2000);
  });
}

// 📤 Send file to server and return the botResponse
async function sendAudioToServer(filePath) {
    const chatId = getTelegramChatId();
    if (!chatId) {
    ipcMain.emit("log-message", null, {
      type: "error",
      message: "Сначала авторизуйтесь через Telegram!",
    });
    return null; // не отправляем ничего!
    }
  try {
    const audioPrompt = getAudioPrompt();
    const gptModel = getGptModel() || "GPT-o3-mini";

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("chatId", chatId);
    formData.append("userPrompt", audioPrompt || "");

    let endpoint = "/api/audiobot/process-audio";
    if (gptModel === "GPT-o3-mini")
      endpoint = "/api/audiobot/process-audio-GPT-o3-mini";
    if (gptModel === "GPT-4o-mini")
      endpoint = "/api/audiobot/process-audio-GPT-4o-mini";
    if (gptModel === "GPT-o1") endpoint = "/api/audiobot/process-audio-GPT-o1";

    // Выполняем POST и ждём ответа
    const response = await axios.post(endpoint, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    });

    const botResponse = response.data.reply;
    if (botResponse) {
      //console.log('[recorder] server reply:', botResponse);
      // Шлём текст в overlay
      sendOverlayText(botResponse);
      return botResponse;
    }
    return null;
  } catch (err) {
    console.error("[recorder] sendAudioToServer error:", err);
    return null;
  }
}

module.exports = { startRecording, stopRecording }; */

//const apiUrl = 'https://eaa5-94-131-21-129.ngrok-free.app//api/audiobot/process-audio';
