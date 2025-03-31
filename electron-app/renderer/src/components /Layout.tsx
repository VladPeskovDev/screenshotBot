import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  const { pathname } = useLocation();
  return (
    <div className="layout">
      <div className="title-bar" />
      <nav className="menu">
        <Link className={pathname === '/' ? 'active' : ''} to="/">Настройки</Link>
        <Link className={pathname === '/faq' ? 'active' : ''} to="/faq">FAQ</Link>
        <Link className={pathname === '/exit' ? 'active' : ''} to="/exit">Выход</Link>
      </nav>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;