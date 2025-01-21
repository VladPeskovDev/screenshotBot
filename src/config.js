// src/config.js
require('dotenv').config();

module.exports = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID
  };
  