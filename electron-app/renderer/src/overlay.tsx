import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import './overlay.css';

const INITIAL_SIZE = { width: 900, height: 90 };

// Парсинг Markdown с подсветкой кода
const parseMarkdownCode = (input: string): string => {
  return input.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const cleaned = code.trim();
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
    const highlighted = hljs.highlight(cleaned, { language }).value;

    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
  }).replace(/\n/g, '<br>');
};

const Overlay: React.FC = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Получение новых сообщений
  useEffect(() => {
    const bridge = window.overlayBridge;
    if (!bridge) return;

    bridge.onUpdateText((newText: string) => {
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

  useEffect(() => {
  const bridge = window.overlayBridge;
  if (!bridge) return;

  (async () => {
    // Минимизируем окно — как при убирании мыши
    await bridge.resizeOverlay(INITIAL_SIZE.width, INITIAL_SIZE.height);
    await bridge.setIgnoreMouseEvents(true);

    // Ждём, чтобы DOM отрисовался
    setTimeout(async () => {
      const el = containerRef.current;
      if (!el) return;

      const { scrollWidth, scrollHeight } = el;
      await bridge.resizeOverlay(scrollWidth, scrollHeight);
      await bridge.setIgnoreMouseEvents(false);

      // Запускаем подсветку кода повторно
      requestAnimationFrame(() => {
        document.querySelectorAll('pre code').forEach(block => {
          hljs.highlightElement(block as HTMLElement);
        });
      });
    }, 20); // 50 мс пауза
  })();
}, [currentIndex]);


  // Автоскролл и подсветка новых блоков
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;

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
      {/** Обновляем `key` чтобы React пересоздавал DOM */}
<div
  key={currentIndex}
  dangerouslySetInnerHTML={{
    __html: parseMarkdownCode(currentText),
  }}
/>


      {history.length > 1 && (
        <div className="nav-buttons">
          <button
            onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
            disabled={currentIndex <= 0}
          >
            ◀ Назад
          </button>
          <button
            onClick={() =>
              setCurrentIndex(i => Math.min(i + 1, history.length - 1))
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

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<Overlay />);
}
