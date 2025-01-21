// src/telegram.js
const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = require('./config');


const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

/**
 * Отправляем готовый Buffer (PNG) в чат.
 * @param {Buffer} imageBuffer
 */
async function sendScreenshot(imageBuffer) {
  await bot.sendPhoto(TELEGRAM_CHAT_ID, imageBuffer);
  console.log('Скриншот (буфер) отправлен в Telegram!');
}

module.exports = {
  sendScreenshot
};
