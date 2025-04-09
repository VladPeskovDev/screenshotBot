// main.js
const { app, globalShortcut, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { sendScreenshot } = require("./modules/screenshot");
const { startRecording, stopRecording } = require("./modules/recorder");
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
} = require("./modules/telegram");

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
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const isDev = !app.isPackaged;
  const rendererUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, 'renderer', 'dist', 'index.html')}`;

  settingsWindow.loadURL(rendererUrl);

  settingsWindow.on("close", (event) => {
    event.preventDefault();
    settingsWindow.hide();
  });

  settingsWindow.on("closed", () => {
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
  globalShortcut.register("CommandOrControl+Shift+S", toggleSettingsWindow);
  globalShortcut.register("CommandOrControl+Left", () => {
    const mode = getMode();
    if (mode === 'direct') {
      const { sendDirectScreenshot } = require('./modules/direct');
      sendDirectScreenshot();
    } else {
      sendScreenshot();
    }
  });

  globalShortcut.register("CommandOrControl+Up", async () => {
    isRecording ? await stopRecording() : await startRecording();
    isRecording = !isRecording;
  });

  console.log("🎤 Горячие клавиши активированы.");
});

app.dock && app.dock.hide();

ipcMain.on("save-settings", (event, { chatId, prompt, screenshotPrompt, mode, directToken, directChatId, gptModel }) => {
  setTelegramChatId(chatId);
  setAudioPrompt(prompt);
  setScreenshotPrompt(screenshotPrompt);
  setMode(mode);
  if (directToken) setDirectToken(directToken);
  if (directChatId) setDirectChatId(directChatId);
  if (gptModel) setGptModel(gptModel);

  console.log("✅ Настройки обновлены:", { chatId, prompt, screenshotPrompt, mode, directToken, directChatId, gptModel });
});

ipcMain.handle("load-settings", () => {
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

ipcMain.on("quit-app", () => {
  console.log("🚸 Приложение завершает работу...");
  BrowserWindow.getAllWindows().forEach((win) => win.destroy());
  app.quit();
  app.exit(0);
});

ipcMain.on('log-message', (event, log) => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((win) => {
    win.webContents.send('log-from-main', log);
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});



/* 
CommandOrControl+Shift+S – Открыть / Закрыть окно настроек.
CommandOrControl+Left – Отправить скриншот.
CommandOrControl+Up – Начать / Остановить запись.
*/

