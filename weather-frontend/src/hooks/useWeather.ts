import { useContext } from 'react';

import {
    WeatherContext,
    type WeatherContextValue,
} from '../stores/weatherContextDefinition';

export function useWeather(): WeatherContextValue {
    const context = useContext(WeatherContext);

    if (!context) {
        throw new Error(
            'useWeather phải được sử dụng bên trong WeatherProvider.',
        );
    }

    return context;
}

export default useWeather;