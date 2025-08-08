const fs = require("fs");
const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { sendScreenshot } = require("./modules/screenshot");
const { startRecording, stopRecording } = require("./modules/recorder");
const {setTelegramChatId, setAudioPrompt, setScreenshotPrompt, getTelegramChatId, getAudioPrompt, getScreenshotPrompt,
  getGptModel, setGptModel, setMode, getMode,
  getDirectChatId, getDirectToken, setDirectToken, setDirectChatId,
  getOverlayEffectEnabled, setOverlayEffectEnabled,
  getMicrophoneIndex, setMicrophoneIndex
} = require("./modules/telegram");
const instance = require('./internal/axiosInstance');
const { spawnSync } = require("child_process");
const { createOverlayWindow, toggleOverlayWindow, getOverlayWindow } = require("./core/windows/overlay");
const { toggleSettingsWindow } = require("./core/windows/settings");
const { registerShortcuts } = require("./core/shortcuts/registerShortcuts");

let ffmpegPath = require("ffmpeg-static");


if (app.isPackaged) {
  ffmpegPath = ffmpegPath.replace(
    `${path.sep}app.asar${path.sep}`,
    `${path.sep}app.asar.unpacked${path.sep}`
  );
}

let overlayEffectEnabled = getOverlayEffectEnabled();

app.whenReady().then(() => {
  createOverlayWindow();

  //Регистрируем шорт каты
  registerShortcuts({
    toggleSettingsWindow,
    toggleOverlayWindow,
    getOverlayEffectEnabled,
    startRecording,
    stopRecording,
    sendScreenshot,
  });
});

app.dock && app.dock.hide();

// Сохранение настроек
ipcMain.on("save-settings", (event, settings) => {
  const {
    chatId, prompt, screenshotPrompt, mode,
    directToken, directChatId, gptModel,
    overlayEffectEnabled: overlayEnabled, microphoneIndex
  } = settings;

  setTelegramChatId(chatId);
  setAudioPrompt(prompt);
  setScreenshotPrompt(screenshotPrompt);
  setMode(mode);
  if (directToken) setDirectToken(directToken);
  if (directChatId) setDirectChatId(directChatId);
  if (gptModel) setGptModel(gptModel);
  if (typeof overlayEnabled === "boolean") {
    setOverlayEffectEnabled(overlayEnabled);
    overlayEffectEnabled = overlayEnabled;
  }
  if (microphoneIndex) setMicrophoneIndex(microphoneIndex);
});

// Загрузка настроек
ipcMain.handle("load-settings", () => ({
  chatId: getTelegramChatId(),
  prompt: getAudioPrompt(),
  screenshotPrompt: getScreenshotPrompt(),
  mode: getMode(),
  directToken: getDirectToken(),
  directChatId: getDirectChatId(),
  gptModel: getGptModel(),
  microphoneIndex: getMicrophoneIndex(),
  overlayEffectEnabled,
}));

// Отправка текста в оверлей
ipcMain.on("send-overlay-text", (event, text) => {
  const overlayWindow = getOverlayWindow();
  if (overlayWindow) {
    overlayWindow.webContents.send("update-overlay-text", text);
  } else {
    console.warn("[Main] overlayWindow is null!");
  }
});

// Изменение размера оверлея
ipcMain.handle('resize-overlay', (event, { width, height }) => {
  const overlayWindow = getOverlayWindow();
  if (overlayWindow) {
    overlayWindow.setSize(Math.ceil(width), Math.ceil(height));
  }
});

// Игнорирование мыши
ipcMain.handle('overlay-set-ignore', (event, ignore) => {
  const overlayWindow = getOverlayWindow();
  if (overlayWindow) {
    overlayWindow.setIgnoreMouseEvents(ignore, { forward: ignore });
  }
});

// Список аудио-устройств
ipcMain.handle("list-audio-devices", () => {
  try {
    const result = spawnSync(ffmpegPath, ['-f', 'avfoundation', '-list_devices', 'true', '-i', ''], {
      encoding: 'utf8'
    });

    const stderr = result.stderr || '';
    const lines = stderr.split('\n');

    let isAudio = false;
    const audioDevices = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.includes("AVFoundation audio devices:")) {
        isAudio = true;
        continue;
      }

      if (trimmed.includes("AVFoundation video devices:")) {
        isAudio = false;
        continue;
      }

      if (isAudio && /^\[AVFoundation indev.*\] \[\d+\]/.test(trimmed)) {
        const cleaned = trimmed.replace(/^.*\[(\d+)\] /, (match, index) => `[${index}] `);
        audioDevices.push(cleaned);
      }
    }

    return audioDevices.length > 0 ? audioDevices : [`⚠️ Аудиоустройства не найдены.`];
  } catch (e) {
    return [`❌ Ошибка при получении устройств: ${e.message}`];
  }
});

// Проверка Telegram ID
ipcMain.handle('check-telegram-id', async (event, id) => {
  try {
    const response = await instance.get('/api/auth/check-user', { params: { id } });
    const data = response.data;
    return { valid: !!data.valid, username: data.username || '' };
  } catch (error) {
    console.error('Ошибка при проверке Telegram ID:', error.message);
    return { valid: false, username: '' };
  }
});

// Загрузка профиля
ipcMain.handle('get-profile', async (_event, chatId) => {
  try {
    const response = await instance.post('/api/account', { chatId });
    return response.data;
  } catch (error) {
    return { error: error.message || 'Ошибка загрузки профиля' };
  }
});

// Открытие внешней ссылки
ipcMain.handle('open-external', async (_event, url) => {
  const { shell } = require('electron');
  await shell.openExternal(url);
});

// Завершение приложения
ipcMain.on("quit-app", () => {
  BrowserWindow.getAllWindows().forEach((win) => win.destroy());
  app.quit();
  app.exit(0);
});

// Обработка логов
ipcMain.on("log-message", (event, log) => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((win) => win.webContents.send("log-from-main", log));
});

// Очистка при выходе
app.on("window-all-closed", () => {});
app.on("will-quit", () => {
  const { globalShortcut } = require("electron");
  globalShortcut.unregisterAll();
});



/* 
CommandOrControl+Shift+S – Открыть / Закрыть окно настроек.
CommandOrControl+Left – Отправить скриншот.
CommandOrControl+Enter – Начать / Остановить запись.
CommandOrControl+Shift+D - Открыть или Закрыть окно overlay.
CommandOrControl+Up – Включить автоматическое скриншотирование.
*/
