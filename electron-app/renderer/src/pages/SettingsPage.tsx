import React, { useEffect, useState } from 'react';
import { saveSettings, loadSettings } from '../ipcBridge';
import { useNavigate } from 'react-router-dom';
import styles from './SettingsPage.module.css';
import type { AppSettings } from '../types';

const SettingsPage: React.FC = () => {
  const [mode, setMode] = useState<'helper' | 'direct'>('helper');
  const [chatId, setChatId] = useState('');
  const [audioPrompt, setAudioPrompt] = useState('');
  const [screenshotPrompt, setScreenshotPrompt] = useState('');
  const [directToken, setDirectToken] = useState('');
  const [directChatId, setDirectChatId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadSettings().then((data: AppSettings) => {
      setChatId(data.chatId);
      setAudioPrompt(data.prompt);
      setScreenshotPrompt(data.screenshotPrompt);
      if (data.mode) setMode(data.mode);
      if (data.directToken) setDirectToken(data.directToken);
      if (data.directChatId) setDirectChatId(data.directChatId);
    });
  }, []);

  const handleSave = () => {
    saveSettings(chatId, audioPrompt, screenshotPrompt, mode, directToken, directChatId);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Настройки</h1>

      <div className={styles.formGroup}>
        <label className={styles.label}>Режим работы:</label>
        <div className={styles.modeButtons}>
          <button
            className={`${styles.modeButton} ${mode === 'helper' ? styles.active : ''}`}
            onClick={() => setMode('helper')}
          >
            С помощником
          </button>
          <button
            className={`${styles.modeButton} ${mode === 'direct' ? styles.active : ''}`}
            onClick={() => setMode('direct')}
          >
            Без помощника
          </button>
        </div>
      </div>

      {mode === 'direct' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Telegram Token:</label>
            <input
              className={styles.input}
              placeholder="Введите Telegram API токен"
              value={directToken}
              onChange={(e) => setDirectToken(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Telegram Chat ID:</label>
            <input
              className={styles.input}
              placeholder="Введите Chat ID"
              value={directChatId}
              onChange={(e) => setDirectChatId(e.target.value)}
            />
          </div>
        </>
      )}

      {mode === 'helper' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Telegram Chat ID (для помощника):</label>
            <input
              className={styles.input}
              placeholder="Введите Telegram Chat ID"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Доп. промпт к аудио:</label>
            <textarea
              className={styles.textarea}
              placeholder="Введите дополнительный системный промт к аудио"
              value={audioPrompt}
              onChange={(e) => setAudioPrompt(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Доп. промпт к скриншоту:</label>
            <textarea
              className={styles.textarea}
              placeholder="Введите дополнительный системный промт к скриншоту"
              value={screenshotPrompt}
              onChange={(e) => setScreenshotPrompt(e.target.value)}
            />
          </div>
        </>
      )}

      <button className={styles.button} onClick={handleSave}>
        Сохранить
      </button>
      <button className={styles.button} onClick={() => navigate('/')}>В меню</button>
    </div>
  );
};

export default SettingsPage;
