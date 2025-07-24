const { BrowserWindow } = require('electron');

let overlayWindowRef = null;
let lastText = '⌛ Ожидание ответа...'; // использовать если ответы меняем каждый раз

//склеиваем ответы 
//let lastText = '⌛ Ожидание ответа...\n';
//let wasFirstRealMessage = false;

// Сохраняем ссылку на окно
function registerOverlayWindow(windowInstance) {
  overlayWindowRef = windowInstance;
}

// Сохраняем текст и отправляем его во фронт (каждый ответ меняет и удаляет предыдущий)
 function sendOverlayText(text) {
  //console.log('[overlayMessenger] sendOverlayText:', text);
  lastText = text;

  if (overlayWindowRef) {
    overlayWindowRef.webContents.send('update-overlay-text', text);
  } else {
    console.warn('[overlayMessenger] overlayWindowRef is null');
  }
} 

  //склеиваем все ответы 
  /*
function sendOverlayText(text) {
  if (!wasFirstRealMessage) {
    lastText = ''; // очищаем ожидание
    wasFirstRealMessage = true;
  }

  lastText += text + '\n';

  if (overlayWindowRef) {
    overlayWindowRef.webContents.send('update-overlay-text', lastText);
  } else {
    console.warn('[overlayMessenger] overlayWindowRef is null');
  }
} */

//  Возвращаем последний полученный текст
function getLastOverlayText() {
  return lastText;
}

module.exports = {
  registerOverlayWindow,
  sendOverlayText,
  getLastOverlayText,
};
