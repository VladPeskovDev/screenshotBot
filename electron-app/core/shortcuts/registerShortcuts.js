const { globalShortcut, ipcMain } = require("electron");
const { sendScreenshot } = require("../../modules/screenshot");
const { startRecording, stopRecording } = require("../../modules/recorder");
const { getMode } = require("../../modules/telegram");
const { showOverlayEffect } = require("../../utils/overlayEffect");

function registerShortcuts({ toggleSettingsWindow, toggleOverlayWindow, getOverlayEffectEnabled }) {
  let isRecording = false;

  // Открытие/закрытие окна настроек
  globalShortcut.register("CommandOrControl+Shift+S", toggleSettingsWindow);

  // Отправка скриншота
  globalShortcut.register("CommandOrControl+Left", () => {
    const mode = getMode();
    if (mode === "direct") {
      const { sendDirectScreenshot } = require("../../modules/direct");
      sendDirectScreenshot(); // напрямую в Telegram
    } else {
      sendScreenshot(); // через GPT/ассистента
    }
    showOverlayEffect(getOverlayEffectEnabled()); // ⚡️ актуальное значение
  });

  // Начать/остановить запись аудио
  globalShortcut.register("CommandOrControl+Enter", async () => {
    ipcMain.emit("log-message", null, {
      type: "info",
      message: isRecording ? "⏹ Остановка записи" : "▶️ Начало записи",
    });

    if (isRecording) {
      showOverlayEffect(getOverlayEffectEnabled());
      await stopRecording();
    } else {
      await startRecording();
    }

    isRecording = !isRecording;
    showOverlayEffect(getOverlayEffectEnabled());
  });

  // Показать/скрыть окно оверлея
  globalShortcut.register("CommandOrControl+Shift+D", toggleOverlayWindow);
}

module.exports = { registerShortcuts };
