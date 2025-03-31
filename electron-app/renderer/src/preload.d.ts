export {};

declare global {
  interface Window {
    electronAPI: {
      saveSettings: (chatId: string, prompt: string, screenshotPrompt: string) => void;
      loadSettings: () => Promise<{ chatId: string; prompt: string; screenshotPrompt: string }>;
      onLogMessage: (callback: (log: { type: string; message: string }) => void) => void;
      sendLog: (log: { type: string; message: string }) => void;
      quitApp: () => void;
    };
  }
}
