export type AppSettings = {
    chatId: string;
    prompt: string;
    screenshotPrompt: string;
    mode: 'helper' | 'direct';
    directToken?: string;
    directChatId?: string;
    gptModel?: 'GPT-o3-mini' | 'GPT-4о' | 'GPT-4o-mini' | 'GPT-o1';
  };
  