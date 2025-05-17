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

  useEffect(() => {
    window.overlayBridge?.onCommand?.((cmd: string) => {
      const el = containerRef.current;
      if (!el) return;
      if (cmd === 'scroll-down') el.scrollBy({ top: 50, behavior: 'smooth' });
      if (cmd === 'scroll-up') el.scrollBy({ top: -50, behavior: 'smooth' });
    });
  }, []);

  return (
    <div className="overlay-container" ref={containerRef}>
      {text}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Overlay />);
