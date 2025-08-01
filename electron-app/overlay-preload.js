const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlayBridge', {
  
  // Подписаться на обновление текста в оверлее
  onUpdateText: (callback) =>
    ipcRenderer.on('update-overlay-text', (_, text) => callback(text)),

  // получить команды из main
  onCommand: (callback) =>
    ipcRenderer.on('overlay-command', (_, cmd) => callback(cmd)),

  // Попросить main изменить размер окна
  resizeOverlay: (width, height) =>
    ipcRenderer.invoke('resize-overlay', { width, height }),

  // Включить или выключить игнорирование всех мышиных событий
  //setIgnoreMouseEvents: (ignore) =>
    //ipcRenderer.invoke('overlay-set-ignore', ignore),
});
