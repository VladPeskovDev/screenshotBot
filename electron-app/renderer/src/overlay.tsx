// src/overlay.tsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './overlay.css';

declare global {
  interface Window {
    overlayBridge?: {
      onUpdateText: (callback: (text: string) => void) => void;
      onCommand?: (callback: (cmd: string) => void) => void;
      resizeOverlay: (width: number, height: number) => Promise<void>;
      setIgnoreMouseEvents: (ignore: boolean) => Promise<void>;
    };
  }
}

const INITIAL_SIZE = { width: 900, height: 90 };

const Overlay: React.FC = () => {
  const [text, setText] = useState('⌛ Ожидание ответа…');
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Подписываемся на обновления текста один раз
  useEffect(() => {
    const bridge = window.overlayBridge;
    if (!bridge) {
      console.warn('overlayBridge ещё не доступен');
      return;
    }
    bridge.onUpdateText(newText => {
      setText(newText);
    });

    // Опционально: сначала игнорируем все события мыши
    bridge.setIgnoreMouseEvents(true);
  }, []);

  // При изменении hovered меняем размер окна и режим обработки мыши
  useEffect(() => {
    const bridge = window.overlayBridge;
    const el = containerRef.current;
    if (!bridge || !el) return;

    (async () => {
      const { scrollWidth, scrollHeight } = el;

      if (hovered) {
        // Разворачиваем окно под текст и принимаем мышиные события
        await bridge.resizeOverlay(scrollWidth, scrollHeight);
        await bridge.setIgnoreMouseEvents(false);
      } else {
        // Возвращаем исходный размер и игнорируем события
        await bridge.resizeOverlay(INITIAL_SIZE.width, INITIAL_SIZE.height);
        await bridge.setIgnoreMouseEvents(true);
      }
    })();
  }, [hovered]);

  return (
    <div
      className="overlay-container"
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {text}
    </div>
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<Overlay />);
}
