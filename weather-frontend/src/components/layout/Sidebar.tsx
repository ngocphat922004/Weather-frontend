import {
  BarChart3,
  CalendarDays,
  CloudSun,
  History,
  LayoutDashboard,
  Settings,
  X,
} from 'lucide-react';

import {
  NavLink,
} from 'react-router-dom';

import './Sidebar.scss';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Forecast',
    path: '/forecast',
    icon: CalendarDays,
  },
  {
    label: 'Analysis',
    path: '/analysis',
    icon: BarChart3,
  },
  {
    label: 'History',
    path: '/history',
    icon: History,
  },
];

function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <aside
      className={[
        'app-sidebar',
        isOpen
          ? 'app-sidebar--open'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Điều hướng chính"
    >
      <div className="app-sidebar__brand">
        <NavLink
          className="app-sidebar__logo"
          to="/"
          onClick={onClose}
        >
          <span
            className="app-sidebar__logo-icon"
            aria-hidden="true"
          >
            <CloudSun />
          </span>

          <span className="app-sidebar__logo-text">
            Weather Analytics
          </span>
        </NavLink>

        <button
          className="app-sidebar__close"
          type="button"
          onClick={onClose}
          aria-label="Đóng menu"
        >
          <X />
        </button>
      </div>

      <nav className="app-sidebar__nav">
        {navigationItems.map(
          ({
            label,
            path,
            icon: Icon,
            end,
          }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'app-sidebar__link',
                  isActive
                    ? 'app-sidebar__link--active'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              <Icon aria-hidden="true" />

              <span>{label}</span>
            </NavLink>
          ),
        )}
      </nav>

      <div className="app-sidebar__footer">
        {/*
         * UI tham khảo có Settings nhưng Swagger và tài liệu
         * hiện chưa có page chức năng tương ứng.
         */}
        <button
          className="app-sidebar__settings"
          type="button"
          disabled
          title="Chức năng đang được phát triển"
        >
          <Settings aria-hidden="true" />

          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;