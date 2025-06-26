export {};

declare global {
  interface Window {
    electronAPI: {
      checkTelegramId: (telegramId: string) => Promise<{ valid: boolean; username: string }>;
      saveSettings: (settings: {
        chatId: string;
        prompt: string;
        screenshotPrompt: string;
        mode: string;
        directToken: string;
        directChatId: string;
        gptModel: string;
        overlayEffectEnabled: boolean;
        microphoneIndex: string;
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
        microphoneIndex: string;
      }>;
      listAudioDevices: () => Promise<string[]>;
      onLogMessage: (callback: (log: { type: string; message: string }) => void) => void;
      sendLog: (log: { type: string; message: string }) => void;
      openExternal: (url: string) => void;
      getProfile: (chatId: string) => Promise<ProfileData | { error: string }>;
      quitApp: () => void;
    };

    overlayBridge?: {
      onUpdateText: (callback: (text: string) => void) => void;
      onCommand?: (callback: (cmd: string) => void) => void;
      resizeOverlay: (width: number, height: number) => Promise<void>;
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
  microphoneIndex: string;
};

