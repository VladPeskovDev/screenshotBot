const screenshot = require('screenshot-desktop');

/**
 * Делает скриншот и возвращает его как Buffer (PNG).
 * @returns {Promise<Buffer>}
 */
async function takeScreenshotBuffer() {
  try {
    const buffer = await screenshot({ format: 'png' });
    return buffer;
  } catch (error) {
    console.error('❌ Ошибка при создании скриншота:', error.message);
    throw error;
  }
}

module.exports = {
  takeScreenshotBuffer,
};
