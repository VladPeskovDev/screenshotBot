import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './overlay.css';

const Overlay = () => {
  const [text, setText] = useState('⌛ Ожидание ответа...');

  useEffect(() => {
  window.overlayBridge?.onUpdateText?.((newText: string) => {
    setText(newText);
  });
}, []);


  return (
    <div className="overlay-container">
      {text}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Overlay />);
