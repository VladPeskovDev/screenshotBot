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




