import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import './overlay.css';

const INITIAL_SIZE = { width: 900, height: 90 };

const Overlay: React.FC = () => {
  const [text, setText] = useState('⌛ Ожидание ответа…');
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bridge = window.overlayBridge;
    if (!bridge) return;

    bridge.onUpdateText(newText => {
      setText(newText);
    });

    bridge.setIgnoreMouseEvents(true);
  }, []);

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

  // 🔽 Автоскролл вниз при новых сообщениях
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }

    // Подсветка кода
    document.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [text]);

  return (
    <div
      className="overlay-container"
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      dangerouslySetInnerHTML={{ __html: parseMarkdownCode(text) }}
    />
  );
};

const parseMarkdownCode = (input: string): string => {
  const escaped = escapeHtml(input);
  return escaped.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const cleaned = code.trim();
    return `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(cleaned)}</code></pre>`;
  }).replace(/\n/g, '<br>');
};

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<Overlay />);
}
