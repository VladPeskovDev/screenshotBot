// src/App.tsx
import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import SettingsPage from './pages/SettingsPage';
import FAQPage from './pages/FAQPage';
import ExitPage from './pages/ExitPage';

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <SettingsPage />, // Стартовая страница — настройки
      },
      {
        path: '/faq',
        element: <FAQPage />,
      },
      {
        path: '/exit',
        element: <ExitPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;