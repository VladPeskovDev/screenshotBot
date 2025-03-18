// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveSettings: (chatId, prompt, screenshotPrompt) => {
    ipcRenderer.send('save-settings', { chatId, prompt, screenshotPrompt });
  },
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  quitApp: () => ipcRenderer.send('quit-app'), // Выход из приложения
});
