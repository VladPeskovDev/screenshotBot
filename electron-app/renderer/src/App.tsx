import { useEffect, useState } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import FAQPage from './pages/FAQPage';
import ExitPage from './pages/ExitPage';
import LogPage from './pages/LogPage';
import AuthPage from './pages/AuthPage';
import { loadSettings, saveSettings } from './ipcBridge';

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/faq', element: <FAQPage /> },
      { path: '/exit', element: <ExitPage /> },
      { path: '/logs', element: <LogPage /> },
    ],
  },
]);

export default function App() {
  const [chatId, setChatId] = useState<null | string>(null);

  useEffect(() => {
    loadSettings().then((settings) => {
      if (settings.chatId) setChatId(settings.chatId);
    });
  }, []);

  if (!chatId) {
    return (
      <AuthPage onSuccess={id => {
  saveSettings(
    id,               // chatId
    '',               // prompt
    '',               // screenshotPrompt
    'helper',         // mode
    '',               // directToken
    '',               // directChatId
    'GPT-4о',         // gptModel
    false,            // overlayEffectEnabled
    ':0'              
  );
  setChatId(id);
}} />
    );
  }

  return <RouterProvider router={router} />;
}
