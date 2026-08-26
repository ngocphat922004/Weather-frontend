import {
  Search,
} from 'lucide-react';

import type {
  FormEvent,
} from 'react';

import { useWeather } from '../../hooks/useWeather';

import './SearchCity.scss';

interface SearchCityProps {
  className?: string;
  placeholder?: string;
  buttonLabel?: string;
}

function SearchCity({
  className = '',
  placeholder = 'Nhập tên thành phố...',
  buttonLabel = 'Tra cứu',
}: SearchCityProps) {
  const { city, changeCity } = useWeather();

  const handleSubmit = (
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
     * Không gọi API trực tiếp tại đây.
     * Page đang mở sẽ tải dữ liệu khi city thực sự thay đổi.
     */
    changeCity(searchedCity);
  };

  return (
    <form
      className={[
        'search-city',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onSubmit={handleSubmit}
      key={city}
    >
      <div className="search-city__field">
        <Search aria-hidden="true" />

        <label
          className="visually-hidden"
          htmlFor="page-city-search"
        >
          Tìm kiếm thành phố
        </label>

        <input
          id="page-city-search"
          name="city"
          type="search"
          defaultValue={city}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>

      <button
        className="app-button app-button--primary"
        type="submit"
      >
        <Search aria-hidden="true" />

        <span>{buttonLabel}</span>
      </button>
    </form>
  );
}

export default SearchCity;