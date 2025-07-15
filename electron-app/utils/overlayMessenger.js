const { BrowserWindow } = require('electron');

let overlayWindowRef = null;
let lastText = '⌛ Ожидание ответа...';

// Сохраняем ссылку на окно
function registerOverlayWindow(windowInstance) {
  overlayWindowRef = windowInstance;
}

// Сохраняем текст и отправляем его во фронт
function sendOverlayText(text) {
  //console.log('[overlayMessenger] sendOverlayText:', text);
  lastText = text;

  if (overlayWindowRef) {
    overlayWindowRef.webContents.send('update-overlay-text', text);
  } else {
    console.warn('[overlayMessenger] overlayWindowRef is null');
  }
}

//  Возвращаем последний полученный текст
function getLastOverlayText() {
  return lastText;
}

module.exports = {
  registerOverlayWindow,
  sendOverlayText,
  getLastOverlayText,
};
