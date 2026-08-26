import { createContext } from 'react';

export interface WeatherContextValue {
    city: string;

    /*
     * Chỉ thay đổi thành phố sau khi người dùng submit.
     * Không gọi theo từng ký tự đang nhập.
     */
    changeCity: (city: string) => void;
}

export const WeatherContext =
    createContext<WeatherContextValue | null>(
        null,
    );