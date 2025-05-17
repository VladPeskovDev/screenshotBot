const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlayBridge', {
  onUpdateText: (callback) => ipcRenderer.on('update-overlay-text', (_, text) => callback(text)),
});


contextBridge.exposeInMainWorld('overlayBridge', {
  onUpdateText: (cb) => ipcRenderer.on('update-overlay-text', (_, text) => cb(text)),
  onCommand: (cb) => ipcRenderer.on('overlay-command', (_, cmd) => cb(cmd)), // 🆕
});