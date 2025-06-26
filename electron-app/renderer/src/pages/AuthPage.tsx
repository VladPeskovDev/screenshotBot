import { useState } from 'react';
import styles from './AuthPage.module.css';



type Props = {
  onSuccess: (chatId: string) => void;
};

export default function AuthPage({ onSuccess }: Props) {
  const [telegramId, setTelegramId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 

  const handleLogin = async () => {
    setError('');
    if (!telegramId.match(/^\d+$/)) {
      setError('Введите корректный Telegram ID');
      return;
    }
    setLoading(true);
    try {
      const data = await window.electronAPI.checkTelegramId(telegramId);
      if (data.valid) {
        setTimeout(() => {
          setLoading(false);
          onSuccess(telegramId);
        }, 1500);
      } else {
        setLoading(false);
        setError('Такой Telegram ID не зарегистрирован в системе.');
      }
    } catch (e) {
      setLoading(false);
      setError('Проверьте интернет-соединение');
      console.error(e);
    }
  };

  const openTelegramBot = () => {
    window.electronAPI.openExternal('https://t.me/SimpleChatGPT5bot');
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.title}>Вход</h2>
      <input
        className={styles.input}
        type="text"
        placeholder="Ваш Telegram ID"
        value={telegramId}
        onChange={e => setTelegramId(e.target.value.replace(/\D/g, ''))}
        inputMode="numeric"
        aria-label="Telegram ID"
        disabled={loading}
      />
      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={handleLogin} disabled={loading}>
          {loading ? (
            <span className={styles.spinnerWrapper}>
              <span className={styles.spinner}></span> Проверка...
            </span>
          ) : (
            'Войти'
          )}
        </button>
        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={openTelegramBot}
          disabled={loading}
        >
          Зарегистрироваться и получить Telegram ID
        </button>
        <button
  className={`${styles.button} ${styles.exitBtn}`}
  onClick={() => window.electronAPI.quitApp()}
  disabled={loading}
>
  Выход
</button>

      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
