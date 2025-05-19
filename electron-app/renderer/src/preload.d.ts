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
      onUpdateText: (callback: (text: string) => void) => void;
      onCommand?: (callback: (cmd: string) => void) => void;
      // Меняет размер окна
      resizeOverlay: (width: number, height: number) => Promise<void>;
      // Включает/выключает игнорирование мышиных событий
      setIgnoreMouseEvents: (ignore: boolean) => Promise<void>;
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

