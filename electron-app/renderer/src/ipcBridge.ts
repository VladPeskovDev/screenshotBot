// src/ipcBridge.ts
export const saveSettings = (chatId: string, prompt: string, screenshotPrompt: string, mode: string, directToken: string, directChatId: string) => {
    window.electronAPI?.saveSettings(chatId, prompt, screenshotPrompt);
  };
  
  export const loadSettings = () => {
    return window.electronAPI?.loadSettings();
  };
  
  export const quitApp = () => {
    window.electronAPI?.quitApp();
  };