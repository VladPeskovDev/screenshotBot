const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveSettings: (settings) => {
    ipcRenderer.send('save-settings', settings);
  },
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  onLogMessage: (callback) => ipcRenderer.on('log-from-main', (_, data) => callback(data)),
  sendLog: (log) => ipcRenderer.send('log-message', log),
  quitApp: () => ipcRenderer.send('quit-app'),
});
