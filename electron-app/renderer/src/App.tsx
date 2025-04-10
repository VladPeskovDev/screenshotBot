import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import FAQPage from './pages/FAQPage';
import ExitPage from './pages/ExitPage';
import LogPage from './pages/LogPage';
import LogListener from './components/LogListener';

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />, 
      },
      {
        path: '/faq',
        element: <FAQPage />,
      },
      {
        path: '/exit',
        element: <ExitPage />,
      },
      {
        path: '/logs',
        element: <LogPage />,
      },
    ],
  },
]);

export default function App() {
  return (
    <>
      <LogListener />
      <RouterProvider router={router} />
    </>
  );
}
