const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlayBridge', {
  onUpdateText: (callback) => ipcRenderer.on('update-overlay-text', (_, text) => callback(text)),
});
