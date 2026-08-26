import {
  Moon,
  Sun,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeToggleProps {
  className?: string;
}

const THEME_STORAGE_KEY =
  'weather:theme';

function getInitialTheme(): ThemeMode {
  try {
    const savedTheme =
      window.localStorage.getItem(
        THEME_STORAGE_KEY,
      );

    if (
      savedTheme === 'light' ||
      savedTheme === 'dark'
    ) {
      return savedTheme;
    }

    return window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

function ThemeToggle({
  className = '',
}: ThemeToggleProps) {
  const [theme, setTheme] =
    useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;

    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        theme,
      );
    } catch {
      /*
       * Không ảnh hưởng chức năng đổi theme
       * nếu localStorage bị chặn.
       */
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === 'light'
        ? 'dark'
        : 'light',
    );
  };

  return (
    <button
      className={[
        'app-icon-button',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === 'light'
          ? 'Bật giao diện tối'
          : 'Bật giao diện sáng'
      }
      title={
        theme === 'light'
          ? 'Chế độ tối'
          : 'Chế độ sáng'
      }
    >
      {theme === 'light' ? (
        <Moon aria-hidden="true" />
      ) : (
        <Sun aria-hidden="true" />
      )}
    </button>
  );
}

export default ThemeToggle;