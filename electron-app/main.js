const fs = require("fs");
const path = require("path");
const { app, globalShortcut, BrowserWindow, ipcMain, screen } = require("electron");
const { sendScreenshot } = require("./modules/screenshot");
const { startRecording, stopRecording } = require("./modules/recorder");
const { setTelegramChatId, setAudioPrompt, setScreenshotPrompt, getTelegramChatId, getAudioPrompt,
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
} = require("./modules/telegram");
const { showOverlayEffect } = require("./utils/overlayEffect");
const { registerOverlayWindow, getLastOverlayText } = require("./utils/overlayMessenger");


let isRecording = false;
let settingsWindow = null;
let overlayWindow = null;
let overlayEffectEnabled = getOverlayEffectEnabled();

function createOverlayWindow() {
  if (overlayWindow) return;
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  const offsetX = 75;
  const panelWidth = 650;
  const x = Math.floor((width - panelWidth) / 2) - offsetX;

  overlayWindow = new BrowserWindow({
    width: 900,
    height: 80,
    x,
    y: 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    resizable: false,
    fullscreenable: false,
    show: false,
    vibrancy: "ultra-dark",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "overlay-preload.js"),
    },
  });

  //overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });


  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const overlayUrl = app.isPackaged
    ? `file://${path.join(__dirname, "renderer", "dist", "overlay.html")}`
    : "http://localhost:5173/overlay.html";

  overlayWindow.loadURL(overlayUrl);

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });

  registerOverlayWindow(overlayWindow);
}

function toggleOverlayWindow() {
  if (!overlayWindow) {
    createOverlayWindow();
  } else {
    overlayWindow.isVisible() ? overlayWindow.hide() : overlayWindow.show();

    if (overlayWindow.isVisible()) {
      const text = getLastOverlayText();
      overlayWindow.webContents.send("update-overlay-text", text);
    }
  }
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 565,
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const isDev = !app.isPackaged;
  const rendererUrl = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "renderer", "dist", "index.html")}`;

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
  createOverlayWindow();

  globalShortcut.register("CommandOrControl+Shift+S", toggleSettingsWindow);

  globalShortcut.register("CommandOrControl+Left", () => {
    const mode = getMode();
    if (mode === "direct") {
      const { sendDirectScreenshot } = require("./modules/direct");
      sendDirectScreenshot();
    } else {
      sendScreenshot();
    }
    showOverlayEffect(overlayEffectEnabled);
  });

  globalShortcut.register("CommandOrControl+Up", async () => {
    ipcMain.emit("log-message", null, {
      type: "info",
      message: isRecording ? "⏹ Остановка записи" : "▶️ Начало записи",
    });
    if (isRecording) {
      showOverlayEffect(overlayEffectEnabled);
      await stopRecording();
    } else {
      await startRecording();
    }
    isRecording = !isRecording;
    showOverlayEffect(overlayEffectEnabled);
  });

  globalShortcut.register("CommandOrControl+Shift+D", toggleOverlayWindow);
});


app.dock && app.dock.hide();

ipcMain.on("save-settings", (event, settings) => {
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
  if (typeof overlayEnabled === "boolean") {
    setOverlayEffectEnabled(overlayEnabled);
    overlayEffectEnabled = overlayEnabled;
  }
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
    overlayEffectEnabled,
  };
});

ipcMain.on("send-overlay-text", (event, text) => {
  if (overlayWindow) {
    overlayWindow.webContents.send("update-overlay-text", text);
  } else {
    console.warn("[Main] overlayWindow is null!");
  }
});

ipcMain.handle('resize-overlay', (event, { width, height }) => {
  if (overlayWindow) {
    overlayWindow.setSize(Math.ceil(width), Math.ceil(height));
  }
});

ipcMain.handle('overlay-set-ignore', (event, ignore) => {
  if (overlayWindow) {
    // когда ignore=true — все клики и скроллы игнорятся (и форвардятся в apps ниже)
    // когда ignore=false — окно принимает все события
    overlayWindow.setIgnoreMouseEvents(ignore, { forward: ignore });
  }
});


ipcMain.on("quit-app", () => {
  BrowserWindow.getAllWindows().forEach((win) => win.destroy());
  app.quit();
  app.exit(0);
});

ipcMain.on("log-message", (event, log) => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((win) => win.webContents.send("log-from-main", log));
});

app.on("window-all-closed", () => {});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});


/* 
CommandOrControl+Shift+S – Открыть / Закрыть окно настроек.
CommandOrControl+Left – Отправить скриншот.
CommandOrControl+Up – Начать / Остановить запись.
CommandOrControl+Shift+D - Открыть или Закрыть окно overlay.
*/
