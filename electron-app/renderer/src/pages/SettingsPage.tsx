// src/pages/SettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { saveSettings, loadSettings } from '../ipcBridge';

const SettingsPage = () => {
  const [chatId, setChatId] = useState('');
  const [audioPrompt, setAudioPrompt] = useState('');
  const [screenshotPrompt, setScreenshotPrompt] = useState('');

  useEffect(() => {
    loadSettings().then((data) => {
      setChatId(data.chatId);
      setAudioPrompt(data.prompt);
      setScreenshotPrompt(data.screenshotPrompt);
    });
  }, []);

  const handleSave = () => {
    saveSettings(chatId, audioPrompt, screenshotPrompt);
  };

  return (
    <div className="container">
      <h1>Настройки</h1>
      <div className="form-group">
        <label>Telegram Chat ID:</label>
        <input value={chatId} onChange={(e) => setChatId(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Доп. промпт к аудио:</label>
        <textarea value={audioPrompt} onChange={(e) => setAudioPrompt(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Доп. промпт к скриншоту:</label>
        <textarea value={screenshotPrompt} onChange={(e) => setScreenshotPrompt(e.target.value)} />
      </div>
      <button className="button" onClick={handleSave}>Сохранить</button>
    </div>
  );
};

export default SettingsPage;