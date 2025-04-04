import { AppSettings } from "./types";

// src/ipcBridge.ts
export const saveSettings = (
  chatId: string,
  prompt: string,
  screenshotPrompt: string,
  mode: string,
  directToken: string,
  directChatId: string,
  gptModel: string
) => {
  window.electronAPI?.saveSettings({
    chatId,
    prompt,
    screenshotPrompt,
    mode,
    directToken,
    directChatId,
    gptModel
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
    gptModel: 'GPT-4о',
  });
};


  
  export const quitApp = () => {
    window.electronAPI?.quitApp();
  };