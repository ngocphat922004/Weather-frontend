import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  WeatherContext,
  type WeatherContextValue,
} from './weatherContextDefinition';

interface WeatherProviderProps {
  children: ReactNode;
}

const DEFAULT_CITY = 'Ho Chi Minh City';

const CITY_STORAGE_KEY =
  'weather:selected-city';

function getInitialCity(): string {
  try {
    const savedCity = window.localStorage
      .getItem(CITY_STORAGE_KEY)
      ?.trim();

    return savedCity || DEFAULT_CITY;
  } catch {
    return DEFAULT_CITY;
  }
}

export function WeatherProvider({
  children,
}: WeatherProviderProps) {
  const [city, setCity] = useState<string>(
    getInitialCity,
  );

  const changeCity = useCallback(
    (newCity: string) => {
      const normalizedCity = newCity
        .trim()
        .replace(/\s+/g, ' ');

      if (!normalizedCity) {
        return;
      }

      /*
       * Không cập nhật state nếu người dùng submit lại
       * đúng thành phố hiện tại.
       */
      setCity((currentCity) => {
        const isSameCity =
          currentCity.toLocaleLowerCase() ===
          normalizedCity.toLocaleLowerCase();

        if (isSameCity) {
          return currentCity;
        }

        try {
          window.localStorage.setItem(
            CITY_STORAGE_KEY,
            normalizedCity,
          );
        } catch {
          /*
           * Ứng dụng vẫn hoạt động nếu trình duyệt
           * không cho phép localStorage.
           */
        }

        return normalizedCity;
      });
    },
    [],
  );

  const contextValue =
    useMemo<WeatherContextValue>(
      () => ({
        city,
        changeCity,
      }),
      [city, changeCity],
    );

  return (
    <WeatherContext.Provider
      value={contextValue}
    >
      {children}
    </WeatherContext.Provider>
  );
}