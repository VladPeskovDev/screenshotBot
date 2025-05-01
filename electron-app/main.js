const fs = require('fs');
const path = require('path');
const { app, globalShortcut, BrowserWindow, ipcMain, screen } = require('electron');
const { sendScreenshot } = require('./modules/screenshot');
const { startRecording, stopRecording } = require('./modules/recorder');
const {
  setTelegramChatId,
  setAudioPrompt,
  setScreenshotPrompt,
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
  getOverlayEffectEnabled,        
  setOverlayEffectEnabled, 
} = require('./modules/telegram');

// ===== Логи которые пишем в файл  =====
/* const mainLogPath = path.join(app.getPath('userData'), 'main-log.txt');
const mainLogStream = fs.createWriteStream(mainLogPath, { flags: 'a' });
const mlog = (...args) => {
  const msg = args.map(String).join(' ');
  mainLogStream.write(`[${new Date().toISOString()}] ${msg}\n`);
};
console.log = mlog;
console.error = (...args) => mlog('[ERROR]', ...args); */


let isRecording = false;
let settingsWindow = null;

// === Новое: состояние overlayEffectEnabled берем из настроек юзера===
let overlayEffectEnabled = getOverlayEffectEnabled();

//функция: показываем эффект мигания 
function showOverlayEffect() {
  if (!overlayEffectEnabled) {
    return;
  }

  // Определяем размеры основного экрана
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    focusable: false,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  overlayWindow.loadURL(`data:text/html,
    <style>
      html, body {
        margin: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.07);
      }
    </style>
  `);

  setTimeout(() => {
    if (!overlayWindow.isDestroyed()) overlayWindow.close();
  }, 200);
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 565,
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

  //console.log('🔗 Loading UI from:', rendererUrl);
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
  const ok1 = globalShortcut.register('CommandOrControl+Shift+S', toggleSettingsWindow);
  const ok2 = globalShortcut.register('CommandOrControl+Left', () => {
    const mode = getMode();
    if (mode === 'direct') {
      const { sendDirectScreenshot } = require('./modules/direct');
      sendDirectScreenshot();
    } else {
      sendScreenshot();
    }
    showOverlayEffect();
  });

  const ok3 = globalShortcut.register('CommandOrControl+Up', async () => {
    ipcMain.emit('log-message', null, {
      type: 'info',
      message: isRecording ? '⏹ Остановка записи' : '▶️ Начало записи',
    });
    if (isRecording) {
      showOverlayEffect();
      await stopRecording();
      showOverlayEffect();
    } else {
      await startRecording();
    }
    isRecording = !isRecording;
    
    showOverlayEffect();
  });
});

app.dock && app.dock.hide();

ipcMain.on('save-settings', (event, settings) => {
  const {
    chatId,
    prompt,
    screenshotPrompt,
    mode,
    directToken,
    directChatId,
    gptModel,
    overlayEffectEnabled: overlayEnabled, 
  } = settings;

  setTelegramChatId(chatId);
  setAudioPrompt(prompt);
  setScreenshotPrompt(screenshotPrompt);
  setMode(mode);
  if (directToken) setDirectToken(directToken);
  if (directChatId) setDirectChatId(directChatId);
  if (gptModel) setGptModel(gptModel);
  if (typeof overlayEnabled === 'boolean') {
    setOverlayEffectEnabled(overlayEnabled); 
    overlayEffectEnabled = overlayEnabled;
  }
});

ipcMain.handle('load-settings', () => {
  return {
    chatId: getTelegramChatId(),
    prompt: getAudioPrompt(),
    screenshotPrompt: getScreenshotPrompt(),
    mode: getMode(),
    directToken: getDirectToken(),
    directChatId: getDirectChatId(),
    gptModel: getGptModel(),
    overlayEffectEnabled, 
  };
});

ipcMain.on('quit-app', () => {
  BrowserWindow.getAllWindows().forEach((win) => win.destroy());
  app.quit();
  app.exit(0);
});

ipcMain.on('log-message', (event, log) => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((win) => win.webContents.send('log-from-main', log));
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});



/* 
CommandOrControl+Shift+S – Открыть / Закрыть окно настроек.
CommandOrControl+Left – Отправить скриншот.
CommandOrControl+Up – Начать / Остановить запись.
*/
