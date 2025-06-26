import { useEffect, useState } from 'react';
import styles from './ProfilePage.module.css'; // создай/добавь стили
import { loadSettings, saveSettings } from '../ipcBridge';
import { useNavigate } from 'react-router-dom';
type ProfileData = {
  firstName: string;
  lastName: string;
  telegramId: string;
  subscription: string;
  endDate: string | null;
  models: { name: string; remainingRequests: number }[];
  error?: string;
};


export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSettings().then(settings => {
      if (!settings.chatId) {
        setError('Нет chatId. Перезайдите в приложение.');
        setLoading(false);
        return;
      }
      window.electronAPI.getProfile(settings.chatId)
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setProfile(data);
          }
          setLoading(false);
        })
        .catch(e => {
          setError('Ошибка при загрузке профиля.');
          setLoading(false);
          console.error(e);
        });
    });
  }, []);

  const handleChangeAccount = () => {
  loadSettings().then(settings => {
    saveSettings(
      '',                       // chatId сбрасываем
      settings.prompt,           // остальные значения оставляем прежними
      settings.screenshotPrompt,
      settings.mode,
      '',
      '',
      '',
      settings.overlayEffectEnabled,
      settings.microphoneIndex
    );
    window.location.reload();
  });
};



  if (loading) return <div className={styles.profileLoading}>Загрузка профиля...</div>;
  if (error) return <div className={styles.profileError}>{error}</div>;
  if (!profile) return null;

  return (
  <>
    <div className={styles.profileContainer}>
      <h2>Профиль пользователя</h2>
      <div className={styles.profileBlock}>
        <div>Имя: <b>{profile.firstName}</b></div>
        <div>Фамилия: <b>{profile.lastName}</b></div>
        <div>Telegram ID: <b>{profile.telegramId}</b></div>
        <div>Подписка: <b>{profile.subscription}</b></div>
        {profile.endDate && <div>До: <b>{profile.endDate}</b></div>}
        <div>
          <b>Лимиты по моделям:</b>
          <ul>
            {profile.models.map(model => (
              <li key={model.name}>
                {model.name}: {model.remainingRequests} запросов
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className={styles.profileButtons}>
      <button className={styles.changeAccountBtn} onClick={handleChangeAccount}>
        Сменить Telegram ID
      </button>
      <button className={styles.button} onClick={() => navigate('/')}>
        В меню
      </button>
    </div>
  </>
);

}