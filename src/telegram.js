// telegram.js
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// Дефолтные настройки
const defaultSettings = {
  telegramChatId: '',
  audioPrompt: '',
  screenshotPrompt: '',
};

// Загружаем настройки из файла (или создаём файл, если его нет)
function loadSettings() {
  try {
    if (!fs.existsSync(settingsPath)) {
      saveSettings(defaultSettings);
      return defaultSettings;
    }

    const data = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Ошибка при загрузке настроек:', error);
    return defaultSettings;
  }
}

// Сохраняем настройки в JSON-файл
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    console.log('✅ Настройки сохранены:', settings);
  } catch (error) {
    console.error('❌ Ошибка при сохранении настроек:', error);
  }
}

// Получаем текущие настройки
const settings = loadSettings();

// Геттеры
function getTelegramChatId() {
  return settings.telegramChatId;
}
function getAudioPrompt() {
  return settings.audioPrompt;
}
function getScreenshotPrompt() {
  return settings.screenshotPrompt;
}

// Сеттеры (обновляют JSON-файл)
function setTelegramChatId(value) {
  settings.telegramChatId = value;
  saveSettings(settings);
}
function setAudioPrompt(value) {
  settings.audioPrompt = value;
  saveSettings(settings);
}
function setScreenshotPrompt(value) {
  settings.screenshotPrompt = value;
  saveSettings(settings);
}

module.exports = {
  getTelegramChatId,
  getAudioPrompt,
  getScreenshotPrompt,
  setTelegramChatId,
  setAudioPrompt,
  setScreenshotPrompt,
};




