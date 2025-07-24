import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import './overlay.css';

const INITIAL_SIZE = { width: 900, height: 90 };

const Overlay: React.FC = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Получение новых сообщений
  useEffect(() => {
    const bridge = window.overlayBridge;
    if (!bridge) return;

    bridge.onUpdateText(newText => {
      setHistory(prev => [...prev, newText]);
      setCurrentIndex(prev => prev + 1);
    });

    bridge.setIgnoreMouseEvents(true);
  }, []);

  // Изменение размера окна при наведении
  useEffect(() => {
    const bridge = window.overlayBridge;
    const el = containerRef.current;
    if (!bridge || !el) return;

    (async () => {
      const { scrollWidth, scrollHeight } = el;
      if (hovered) {
        await bridge.resizeOverlay(scrollWidth, scrollHeight);
        await bridge.setIgnoreMouseEvents(false);
      } else {
        await bridge.resizeOverlay(INITIAL_SIZE.width, INITIAL_SIZE.height);
        await bridge.setIgnoreMouseEvents(true);
      }
    })();
  }, [hovered]);

  // Автоскролл вниз и подсветка кода
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }

    requestAnimationFrame(() => {
      document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block as HTMLElement);
      });
    });
  }, [history, currentIndex]);

  const currentText =
    history.length === 0
      ? '⌛ Ожидание ответа…'
      : history[Math.max(0, currentIndex)];

  return (
    <div
      className="overlay-container"
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        dangerouslySetInnerHTML={{ __html: parseMarkdownCode(currentText) }}
      />

      {history.length > 1 && (
        <div className="nav-buttons">
          <button
            onClick={() =>
              setCurrentIndex(prev => Math.max(prev - 1, 0))
            }
            disabled={currentIndex <= 0}
          >
            ◀ Назад
          </button>
          <button
            onClick={() =>
              setCurrentIndex(prev => Math.min(prev + 1, history.length - 1))
            }
            disabled={currentIndex >= history.length - 1}
          >
            ▶ Вперёд
          </button>
          <button onClick={() => setCurrentIndex(history.length - 1)}>
            ⏩ Последний
          </button>
        </div>
      )}
    </div>
  );
};

// Обработка Markdown-блока с кодом в HTML
const parseMarkdownCode = (input: string): string => {
  return input.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const cleaned = code.trim();
    return `<pre><code class="language-${lang || 'plaintext'}">${cleaned}</code></pre>`;
  }).replace(/\n/g, '<br>');
};

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<Overlay />);
}

