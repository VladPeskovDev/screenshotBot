import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './overlay.css';

const Overlay = () => {
  const [text, setText] = useState('⌛ Ожидание ответа...');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.overlayBridge?.onUpdateText?.((newText: string) => {
      setText(newText);
    });
  }, []);


  return (
    <div className="overlay-container" ref={containerRef}>
      {text}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Overlay />);
