export {};

declare global {
  interface Window {
    electronAPI: {
      saveSettings: (settings: {
        chatId: string;
        prompt: string;
        screenshotPrompt: string;
        mode: string;
        directToken: string;
        directChatId: string;
        gptModel: string;
        overlayEffectEnabled: boolean;
      }) => void;
      loadSettings: () => Promise<{
        chatId: string;
        prompt: string;
        screenshotPrompt: string;
        mode: string;
        directToken: string;
        directChatId: string;
        gptModel: string;
        overlayEffectEnabled: boolean;
      }>;
      onLogMessage: (callback: (log: { type: string; message: string }) => void) => void;
      sendLog: (log: { type: string; message: string }) => void;
      quitApp: () => void;
    };
    overlayBridge?: {
      /**
       * Регистрирует колбэк для обновления текста в overlay
       * @param callback Функция, принимающая новый текст для отображения
       */
      onUpdateText: (callback: (newText: string) => void) => void;
      onCommand?: (callback: (cmd: string) => void) => void;
    };
  }
}

export type AppSettings = {
  chatId: string;
  prompt: string;
  screenshotPrompt: string;
  mode: 'helper' | 'direct';
  directToken?: string;
  directChatId?: string;
  gptModel?: 'GPT-o3-mini' | 'GPT-4о' | 'GPT-4o-mini' | 'GPT-o1';
  overlayEffectEnabled: boolean;
};

