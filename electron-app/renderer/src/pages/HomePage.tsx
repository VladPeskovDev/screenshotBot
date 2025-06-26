import { useNavigate } from 'react-router-dom';
import './HomePage.css';



const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container home">
      <h1></h1>
      <button className="button" onClick={() => navigate('/profile')}>
        Профиль
      </button>
      <button className="button" onClick={() => navigate('/settings')}>Настройки</button>
      <button className="button" onClick={() => navigate('/faq')}>FAQ</button>
      <button className="button" onClick={() => navigate('/logs')}>Логи</button>
      <button className="button exit-btn" onClick={() => navigate('/exit')}>Выход</button>
      
    </div>
  );
};

export default HomePage;
