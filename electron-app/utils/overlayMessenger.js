const { BrowserWindow } = require('electron');

let overlayWindowRef = null;
let messages = ['⌛ Ожидание ответа...'];
let wasFirstRealMessage = false;

// Сохраняем ссылку на окно оверлея
function registerOverlayWindow(windowInstance) {
  overlayWindowRef = windowInstance;
}

// Отправляем текст в оверлей (накапливаем сообщения)
function sendOverlayText(text) {
  if (!wasFirstRealMessage) {
    messages = []; // убираем "Ожидание ответа..."
    wasFirstRealMessage = true;
  }

  messages.push(text);
  _updateOverlay(); // внутреннее обновление UI
}

// Удаляет самое старое сообщение
function removeOldestMessage() {
  if (messages.length > 0) {
    messages.shift();
    _updateOverlay();
  }
}

// Полная очистка
function clearOverlayText() {
  messages = ['⌛ Ожидание ответа...'];
  wasFirstRealMessage = false;
  _updateOverlay();
}

// Получаем весь текст для отображения
function getLastOverlayText() {
  return messages.join('\n\n');
}

// Внутренний метод отправки в окно
function _updateOverlay() {
  if (overlayWindowRef) {
    overlayWindowRef.webContents.send('update-overlay-text', getLastOverlayText());
  } else {
    console.warn('[overlayMessenger] overlayWindowRef is null');
  }
}

module.exports = {
  registerOverlayWindow,
  sendOverlayText,
  getLastOverlayText,
  clearOverlayText,
  removeOldestMessage,
};
