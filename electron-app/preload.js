// preload.js
const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
  saveSettings: (settings) => {
    ipcRenderer.send('save-settings', settings);
  },
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  onLogMessage: (callback) => ipcRenderer.on('log-from-main', (_, data) => callback(data)),
  quitApp: () => ipcRenderer.send('quit-app'),
});
