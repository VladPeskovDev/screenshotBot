// src/main.js
const { app, globalShortcut } = require('electron');
const { sendScreenshot } = require('./telegram');
const { takeScreenshotBuffer } = require('./screenshot'); // <-- переименовано!

let isProcessing = false;

function registerGlobalHotkey() {
  const shortcut = 'CommandOrControl+Shift+S';

  const success = globalShortcut.register(shortcut, async () => {
    console.log('Горячая клавиша нажата:', shortcut);

    if (isProcessing) {
      console.log('Скрипт ещё обрабатывает предыдущий скриншот...');
      return;
    }

    isProcessing = true;
    try {
      // Берём скриншот как буфер
      const screenshotBuffer = await takeScreenshotBuffer();

      // Отправляем буфер в Telegram
      await sendScreenshot(screenshotBuffer);
    } catch (err) {
      console.error('Ошибка во время скриншота или отправки:', err);
    } finally {
      isProcessing = false;
    }
  });

  if (!success) {
    console.error('Не удалось зарегистрировать сочетание клавиш:', shortcut);
  }
}

app.whenReady().then(() => {
  registerGlobalHotkey();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
