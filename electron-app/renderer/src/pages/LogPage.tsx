import React from 'react';
import { useLogStore } from '../store/useLogStore';
import styles from './LogPage.module.css';
import { useNavigate } from 'react-router-dom';

const LogPage = () => {
  const logs = useLogStore((state) => state.logs);
  const navigate = useNavigate();

  return (
    <div className="log-container">
      <h1>Логи</h1>
      <div className="log-block">
        {logs.length === 0 && <p>Пока нет сообщений</p>}
        {logs.map((log, idx) => (
          <div key={idx} className={`log-entry ${log.type}`}>
            <span className="log-type">[{log.type.toUpperCase()}]</span> {log.message}
          </div>
        ))}
      </div>
      <button className={styles.button} onClick={() => navigate('/')}>
        В меню
      </button>
    </div>
  );
};

export default LogPage;