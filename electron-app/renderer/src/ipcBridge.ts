import { AppSettings } from "./types";

export const saveSettings = (
  chatId: string,
  prompt: string,
  screenshotPrompt: string,
  mode: string,
  directToken: string,
  directChatId: string,
  gptModel: string,
  overlayEffectEnabled: boolean,
  microphoneIndex: string
) => {
  window.electronAPI?.saveSettings({
    chatId,
    prompt,
    screenshotPrompt,
    mode,
    directToken,
    directChatId,
    gptModel,
    overlayEffectEnabled,
    microphoneIndex
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
    overlayEffectEnabled: false,
    microphoneIndex: ':0'
  });
};

export const sendLogMessage = (type: 'info' | 'error', message: string) => {
  window.electronAPI?.sendLog?.({ type, message });
};

export const quitApp = () => {
  window.electronAPI?.quitApp();
};
