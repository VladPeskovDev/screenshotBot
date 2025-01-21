const { app, globalShortcut } = require('electron');
const { sendScreenshot } = require('./telegram');
const { takeScreenshotBuffer } = require('./screenshot');
//const fs = require('fs');

// Спрятать иконку Electron в Dock (только на macOS)
if (process.platform === 'darwin') {
  app.dock.hide();
}

let isProcessing = false;

function registerGlobalHotkey() {
  // Меняем сочетание клавиш при необходимости
   //const shortcut = 'CommandOrControl+Shift+S';
  const shortcut = 'CommandOrControl+Left';

  const success = globalShortcut.register(shortcut, async () => {
   // fs.writeFileSync(
     // '/Users/vladislav/Desktop/hotkey-log.txt',
      //`Hotkey pressed: ${new Date().toLocaleString()}\n`,
      //{ flag: 'a' } // 'a' - дозапись в конец файла
    //);
    //console.log('Горячая клавиша нажата:', shortcut);

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

// При завершении приложения освобождаем шорткаты
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});


