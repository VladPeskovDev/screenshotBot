// src/pages/FAQPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FAQPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <h1>FAQ</h1>
      <p>Тут будут часто задаваемые вопросы.</p>
      <button className="button" onClick={() => navigate('/')}>В меню</button>
    </div>
  );
};

export default FAQPage;
