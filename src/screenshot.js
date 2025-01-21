// src/screenshot.js
const screenshot = require('screenshot-desktop');

/**
 * Делает скриншот и возвращает его как Buffer (PNG).
 * @returns {Promise<Buffer>}
 */
async function takeScreenshotBuffer() {
  // Берём скриншот в формате PNG
  const buffer = await screenshot({ format: 'png' });
  /* if (buffer.length === 0) {
    fs.writeFileSync('/Users/vladislav/Desktop/test.txt', 'Screenshot is empty\n', { flag: 'a' });
    return;
  } 
  // Можно проверить размер, чтобы убедиться, что не пустой
  console.log('Размер полученного буфера:', buffer.length, 'байт'); */
  return buffer;
}


module.exports = {
  takeScreenshotBuffer
};





/* const screenshot = require('screenshot-desktop');
const fs = require('fs');
const path = require('path');


  //Делаем скриншот с уникальным именем и возвращаем путь к нему.
 // @returns {Promise<string>} - путь к созданному png-файлу
 
async function takeScreenshot() {
  const fileName = `screenshot-${Date.now()}.png`;
  const filePath = path.join(__dirname, fileName);

  await screenshot({ filename: filePath });

  if (!fs.existsSync(filePath)) {
    throw new Error('Скриншот не был создан');
  }

  return filePath;
}

module.exports = {
  takeScreenshot
}; */
