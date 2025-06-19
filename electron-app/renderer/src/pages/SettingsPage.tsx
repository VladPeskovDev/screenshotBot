import React, { useEffect, useState } from 'react';
import { saveSettings, loadSettings, sendLogMessage } from '../ipcBridge';
import { useNavigate } from 'react-router-dom';
import styles from './SettingsPage.module.css';
import type { AppSettings } from '../types';

const SettingsPage: React.FC = () => {
  const [mode, setMode] = useState<'helper' | 'direct'>('helper');
  const [chatId, setChatId] = useState('');
  const [isChatIdEditable, setIsChatIdEditable] = useState(false);
  const [audioPrompt, setAudioPrompt] = useState('');
  const [screenshotPrompt, setScreenshotPrompt] = useState('');
  const [directToken, setDirectToken] = useState('');
  const [directChatId, setDirectChatId] = useState('');
  const [gptModel, setGptModel] = useState<'GPT-o3-mini' | 'GPT-4о' | 'GPT-4o-mini' | 'GPT-o1'>('GPT-4о');
  const [overlayEffectEnabled, setOverlayEffectEnabled] = useState(false);
  const [microphoneIndex, setMicrophoneIndex] = useState(':0');
  const [audioDevices, setAudioDevices] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadSettings().then((data: AppSettings & { microphoneIndex?: string }) => {
      setChatId(data.chatId);
      setAudioPrompt(data.prompt);
      setScreenshotPrompt(data.screenshotPrompt);
      if (data.mode) setMode(data.mode);
      if (data.directToken) setDirectToken(data.directToken);
      if (data.directChatId) setDirectChatId(data.directChatId);
      if (data.gptModel) setGptModel(data.gptModel);
      if (data.overlayEffectEnabled !== undefined) setOverlayEffectEnabled(data.overlayEffectEnabled);
      if (data.microphoneIndex) setMicrophoneIndex(data.microphoneIndex);
    });

    window.electronAPI.listAudioDevices().then(setAudioDevices);
  }, []);

  const handleSave = () => {
    saveSettings(
      chatId,
      audioPrompt,
      screenshotPrompt,
      mode,
      directToken,
      directChatId,
      gptModel,
      overlayEffectEnabled,
      microphoneIndex
    );
    sendLogMessage('info', '✅ Настройки успешно сохранены.');
  };

  const handleChatIdDoubleClick = () => {
    setIsChatIdEditable(true);
  };

  const handleChatIdBlur = () => {
    setIsChatIdEditable(false);
    sendLogMessage('info', '🟢 Telegram ID обновлён.');
  };

  const handleChatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    setChatId(onlyDigits);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Настройки</h1>

      <div className={styles.formGroup}>
        <label className={styles.label}>Режим работы:</label>
        <div className={styles.modeButtons}>
          <button className={`${styles.modeButton} ${mode === 'helper' ? styles.active : ''}`} onClick={() => setMode('helper')}>
            <em>С помощником</em>
          </button>
          <button className={`${styles.modeButton} ${mode === 'direct' ? styles.active : ''}`} onClick={() => setMode('direct')}>
            <em>Без помощника</em>
          </button>
        </div>
      </div>

      {mode === 'direct' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Telegram Token:</label>
            <input className={styles.input} value={directToken} onChange={(e) => setDirectToken(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Telegram Chat ID:</label>
            <input className={styles.input} value={directChatId} onChange={(e) => setDirectChatId(e.target.value)} />
          </div>
        </>
      )}

      {mode === 'helper' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Модель GPT:</label>
            <select className={`${styles.input} ${styles.select}`} value={gptModel} onChange={(e) => setGptModel(e.target.value as never)}>
              <option value="GPT-o3-mini">GPT-o3-mini</option>
              <option value="GPT-4о">GPT-4о</option>
              <option value="GPT-4o-mini">GPT-4o-mini</option>
              <option value="GPT-o1">GPT-o1</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Telegram ID:</label>
            <input
              className={`${styles.input} ${isChatIdEditable ? styles.editable : styles.disabledInput}`}
              value={chatId}
              readOnly={!isChatIdEditable}
              inputMode="numeric"
              onDoubleClick={handleChatIdDoubleClick}
              onChange={handleChatIdChange}
              onBlur={handleChatIdBlur}
            />
            {!isChatIdEditable && (
              <small style={{ color: '#ccc' }}>Нажмите дважды для редактирования</small>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Доп. промпт к аудио:</label>
            <textarea className={styles.textarea} value={audioPrompt} onChange={(e) => setAudioPrompt(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Доп. промпт к скриншоту:</label>
            <textarea className={styles.textarea} value={screenshotPrompt} onChange={(e) => setScreenshotPrompt(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Выбрать микрофон:</label>
            <select className={`${styles.input} ${styles.select}`} value={microphoneIndex} onChange={(e) => setMicrophoneIndex(e.target.value)}>
              {audioDevices.map((line, i) => (
                <option key={i} value={`:${i}`}>{line}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className={styles.formGroup}>
        <div className={styles.switchCard}>
          <div className={styles.switchContent}>
            <div>
              <div className={styles.switchTitle}>✨ Эффект мигания экрана</div>
              <div className={styles.switchDescription}>Экран будет мигать при действиях (запись, скриншот).</div>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" checked={overlayEffectEnabled} onChange={(e) => setOverlayEffectEnabled(e.target.checked)} />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
      </div>

      <button className={styles.button} onClick={handleSave}>Сохранить</button>
      <button className={styles.button} onClick={() => navigate('/')}>В меню</button>
    </div>
  );
};

export default SettingsPage;
