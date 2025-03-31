// src/pages/SettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { saveSettings, loadSettings } from '../ipcBridge';
import { useNavigate } from 'react-router-dom';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
  const [chatId, setChatId] = useState('');
  const [audioPrompt, setAudioPrompt] = useState('');
  const [screenshotPrompt, setScreenshotPrompt] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSettings().then((data: { chatId: React.SetStateAction<string>; prompt: React.SetStateAction<string>; screenshotPrompt: React.SetStateAction<string>; }) => {
      setChatId(data.chatId);
      setAudioPrompt(data.prompt);
      setScreenshotPrompt(data.screenshotPrompt);
    });
  }, []);

  const handleSave = () => {
    saveSettings(chatId, audioPrompt, screenshotPrompt);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Настройки</h1>

      <div className={styles.formGroup}>
        <label className={styles.label}>Telegram Chat ID:</label>
        <input
          className={styles.input}
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Доп. промпт к аудио:</label>
        <textarea
          className={styles.textarea}
          value={audioPrompt}
          onChange={(e) => setAudioPrompt(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Доп. промпт к скриншоту:</label>
        <textarea
          className={styles.textarea}
          value={screenshotPrompt}
          onChange={(e) => setScreenshotPrompt(e.target.value)}
        />
      </div>

      <button className={styles.button} onClick={handleSave}>
        Сохранить
      </button>
      <button className={styles.button} onClick={() => navigate('/')}>
        В меню
      </button>
    </div>
  );
};

export default SettingsPage;
