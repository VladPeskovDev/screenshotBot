export type AppSettings = {
    chatId: string;
    prompt: string;
    screenshotPrompt: string;
    mode: 'helper' | 'direct';
    directToken?: string;
    directChatId?: string;
  };
  