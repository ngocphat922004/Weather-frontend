import {
  Bell,
  MapPin,
  Menu,
  Search,
} from 'lucide-react';

import type {
  FormEvent,
} from 'react';

import { useWeather } from '../../hooks/useWeather';

import ThemeToggle from '../common/ThemeToggle';

import './Header.scss';

interface HeaderProps {
  onMenuOpen: () => void;
}

function Header({
  onMenuOpen,
}: HeaderProps) {
  const { city, changeCity } = useWeather();

  const handleSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget,
    );

    const searchedCity = String(
      formData.get('city') ?? '',
    ).trim();

    if (!searchedCity) {
      return;
    }

    /*
     * Chỉ submit form mới thay đổi thành phố.
     * Việc gõ từng ký tự không phát sinh request.
     */
    changeCity(searchedCity);
  };

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          className="app-icon-button app-header__menu"
          type="button"
          onClick={onMenuOpen}
          aria-label="Mở menu"
        >
          <Menu aria-hidden="true" />
        </button>

        <form
          className="app-header__search"
          onSubmit={handleSearch}
          key={city}
        >
          <Search aria-hidden="true" />

          <label
            className="visually-hidden"
            htmlFor="global-city-search"
          >
            Tìm kiếm thành phố
          </label>

          <input
            id="global-city-search"
            name="city"
            type="search"
            defaultValue={city}
            placeholder="Tìm kiếm địa điểm..."
            autoComplete="off"
          />

          <button
            type="submit"
            aria-label="Tìm kiếm"
          >
            Tìm
          </button>
        </form>
      </div>

      <div className="app-header__actions">
        <div
          className="app-header__location"
          title={city}
        >
          <MapPin aria-hidden="true" />

          <span>{city}</span>
        </div>

        <ThemeToggle />

        <button
          className="app-icon-button app-header__notification"
          type="button"
          aria-label="Thông báo"
        >
          <Bell aria-hidden="true" />

          <span
            className="app-header__notification-dot"
            aria-hidden="true"
          />
        </button>

        <button
          className="app-header__profile"
          type="button"
          aria-label="Tài khoản quản trị viên"
        >
          <span className="app-header__avatar">
            QT
          </span>

          <span className="app-header__profile-info">
            <strong>Quản trị viên</strong>
            <small>Administrator</small>
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;