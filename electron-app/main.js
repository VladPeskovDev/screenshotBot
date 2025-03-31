// main.js
const { app, globalShortcut, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { sendScreenshot } = require("./screenshot");
const { startRecording, stopRecording } = require("./recorder");
const {
  setTelegramChatId,
  setAudioPrompt,
  setScreenshotPrompt,
  getTelegramChatId,
  getAudioPrompt,
  getScreenshotPrompt,
} = require("./telegram");

let isRecording = false;
let settingsWindow = null;

/**
 * Создаёт окно настроек (но НЕ закрывает приложение при нажатии на крестик)
 */
function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show(); // Если уже открыто, просто показываем
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //settingsWindow.loadURL(`file://${path.join(__dirname, 'renderer/dist/index.html')}#/settings`);

  const isDev = !app.isPackaged;

const rendererUrl = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(__dirname, 'renderer/dist/index.html')}`;

settingsWindow.loadURL(rendererUrl);



  // Окно НЕ закрывается, а просто скрывается при нажатии на крестик
  settingsWindow.on("close", (event) => {
    event.preventDefault();
    settingsWindow.hide();
  });

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

/**
 * Открывает/закрывает окно настроек по горячей клавише
 */
function toggleSettingsWindow() {
  if (!settingsWindow) {
    createSettingsWindow();
  } else {
    settingsWindow.isVisible() ? settingsWindow.hide() : settingsWindow.show();
  }
}

app.whenReady().then(() => {
  
  globalShortcut.register("CommandOrControl+Shift+S", toggleSettingsWindow);
  globalShortcut.register("CommandOrControl+Left", sendScreenshot);
  globalShortcut.register("CommandOrControl+Shift+R", async () => {
    isRecording ? await stopRecording() : await startRecording();
    isRecording = !isRecording;
  });
  console.log("🎤 Горячие клавиши активированы.");
});

app.dock && app.dock.hide();

/**
 * 🔹 Сохранение настроек через IPC
 */
ipcMain.on("save-settings", (event, { chatId, prompt, screenshotPrompt }) => {
  setTelegramChatId(chatId);
  setAudioPrompt(prompt);
  setScreenshotPrompt(screenshotPrompt);
  console.log("✅ Настройки обновлены:", { chatId, prompt, screenshotPrompt });
});

/**
 * 🔹 Добавляем обработчик для загрузки настроек
 */
ipcMain.handle("load-settings", () => {
  return {
    chatId: getTelegramChatId(),
    prompt: getAudioPrompt(),
    screenshotPrompt: getScreenshotPrompt(),
  };
});

/**
 * 🔹 Закрытие приложения по кнопке "Выход"
 */
ipcMain.on("quit-app", () => {
  console.log("🛑 Приложение завершает работу...");
  BrowserWindow.getAllWindows().forEach((win) => win.destroy()); // Закрываем все окна
  app.quit(); // Стандартный выход (может не сработать)
  app.exit(0); // Принудительное завершение
});

// Очистка горячих клавиш при выходе
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

/* 
CommandOrControl+Shift+S – Открыть / Закрыть окно настроек.
CommandOrControl+Left – Отправить скриншот.
CommandOrControl+Shift+R – Начать / Остановить запись.

*/

