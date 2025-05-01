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
        overlayEffectEnabled: boolean; // 🆕 добавили
      }) => void;      
      loadSettings: () => Promise<{
        chatId: string;
        prompt: string;
        screenshotPrompt: string;
        mode: string;
        directToken: string;
        directChatId: string;
        gptModel: string;
        overlayEffectEnabled: boolean; // 🆕 добавили
      }>;
      onLogMessage: (callback: (log: { type: string; message: string }) => void) => void;
      sendLog: (log: { type: string; message: string }) => void;
      quitApp: () => void;
    };
  }
}

