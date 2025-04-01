// src/ipcBridge.ts
import type { AppSettings } from './types';
export const saveSettings = (
  chatId: string,
  prompt: string,
  screenshotPrompt: string,
  mode: string,
  directToken: string,
  directChatId: string
) => {
  window.electronAPI?.saveSettings({
    chatId,
    prompt,
    screenshotPrompt,
    mode,
    directToken,
    directChatId
  });
};

  
  
export const loadSettings = (): Promise<AppSettings> => {
  if (window.electronAPI?.loadSettings) {
    return window.electronAPI.loadSettings() as Promise<AppSettings>; 
  }

  return Promise.resolve({
    chatId: '',
    prompt: '',
    screenshotPrompt: '',
    mode: 'helper',
    directToken: '',
    directChatId: '',
  });
};


  
  export const quitApp = () => {
    window.electronAPI?.quitApp();
  };