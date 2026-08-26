import {
  useEffect,
  useState,
} from 'react';

import {
  Outlet,
} from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';

import './AppLayout.scss';

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        closeSidebar();
      }
    };

    window.addEventListener(
      'keydown',
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) {
      document.body.style.removeProperty(
        'overflow',
      );

      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.removeProperty(
        'overflow',
      );
    };
  }, [isSidebarOpen]);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <Header onMenuOpen={openSidebar} />

      {isSidebarOpen && (
        <button
          className="app-layout__overlay"
          type="button"
          onClick={closeSidebar}
          aria-label="Đóng menu"
        />
      )}

      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;