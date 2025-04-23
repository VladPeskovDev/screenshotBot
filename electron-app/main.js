const fs = require('fs');
const path = require('path');
const { app, globalShortcut, BrowserWindow, ipcMain } = require('electron');
const { sendScreenshot } = require('./modules/screenshot');
const { startRecording, stopRecording } = require('./modules/recorder');
const { setTelegramChatId, setAudioPrompt, setScreenshotPrompt,
  getTelegramChatId,
  getAudioPrompt,
  getScreenshotPrompt,
  getGptModel,
  setGptModel,
  setMode,
  getMode,
  getDirectChatId,
  getDirectToken,
  setDirectToken,
  setDirectChatId,
} = require('./modules/telegram');

// ===== Logging to file in production/main process =====
const mainLogPath = path.join(app.getPath('userData'), 'main-log.txt');
const mainLogStream = fs.createWriteStream(mainLogPath, { flags: 'a' });
const mlog = (...args) => {
  const msg = args.map(String).join(' ');
  mainLogStream.write(`[\${new Date().toISOString()}] \${msg}\n`);
};
console.log = mlog;
console.error = (...args) => mlog('[ERROR]', ...args);

console.log('🟢 main.js loaded');

let isRecording = false;
let settingsWindow = null;

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 550,
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = !app.isPackaged;
  const rendererUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, 'renderer', 'dist', 'index.html')}`;

  console.log('🔗 Loading UI from:', rendererUrl);
  settingsWindow.loadURL(rendererUrl);

  settingsWindow.on('close', (event) => {
    event.preventDefault();
    settingsWindow.hide();
  });
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function toggleSettingsWindow() {
  if (!settingsWindow) {
    createSettingsWindow();
  } else {
    settingsWindow.isVisible() ? settingsWindow.hide() : settingsWindow.show();
  }
}

app.whenReady().then(() => {
  console.log('🎉 app.whenReady');

  const ok1 = globalShortcut.register('CommandOrControl+Shift+S', toggleSettingsWindow);
  console.log('🔑 register CommandOrControl+Shift+S:', ok1);

  const ok2 = globalShortcut.register('CommandOrControl+Left', () => {
    console.log('⌨️ Shortcut Left pressed');
    const mode = getMode();
    if (mode === 'direct') {
      console.log('📷 direct mode screenshot');
      const { sendDirectScreenshot } = require('./modules/direct');
      sendDirectScreenshot();
    } else {
      console.log('📷 normal mode screenshot');
      sendScreenshot();
    }
  });
  console.log('🔑 register CommandOrControl+Left:', ok2);

  const ok3 = globalShortcut.register('CommandOrControl+Up', async () => {
    console.log('⌨️ Shortcut Up pressed, isRecording=', isRecording);
    ipcMain.emit('log-message', null, {
      type: 'info',
      message: isRecording ? '⏹ Остановка записи' : '▶️ Начало записи',
    });
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
    isRecording = !isRecording;
    console.log('🛑 isRecording now=', isRecording);
  });
  console.log('🔑 register CommandOrControl+Up:', ok3);
});

app.dock && app.dock.hide();

ipcMain.on('save-settings', (event, settings) => {
  console.log('💾 save-settings:', settings);
  const { chatId, prompt, screenshotPrompt, mode, directToken, directChatId, gptModel } = settings;
  setTelegramChatId(chatId);
  setAudioPrompt(prompt);
  setScreenshotPrompt(screenshotPrompt);
  setMode(mode);
  if (directToken) setDirectToken(directToken);
  if (directChatId) setDirectChatId(directChatId);
  if (gptModel) setGptModel(gptModel);
});

ipcMain.handle('load-settings', () => {
  console.log('💾 load-settings');
  return {
    chatId: getTelegramChatId(),
    prompt: getAudioPrompt(),
    screenshotPrompt: getScreenshotPrompt(),
    mode: getMode(),
    directToken: getDirectToken(),
    directChatId: getDirectChatId(),
    gptModel: getGptModel(),
  };
});

ipcMain.on('quit-app', () => {
  console.log('🚪 quit-app');
  BrowserWindow.getAllWindows().forEach((win) => win.destroy());
  app.quit();
  app.exit(0);
});

ipcMain.on('log-message', (event, log) => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((win) => win.webContents.send('log-from-main', log));
});

app.on('will-quit', () => {
  console.log('🚪 will-quit, unregisterAll shortcuts');
  globalShortcut.unregisterAll();
});

/* 
CommandOrControl+Shift+S – Открыть / Закрыть окно настроек.
CommandOrControl+Left – Отправить скриншот.
CommandOrControl+Up – Начать / Остановить запись.
*/
