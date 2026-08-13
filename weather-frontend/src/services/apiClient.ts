import axios, {
    AxiosError,
    type AxiosResponse,
} from 'axios';

import type {
    ApiErrorResponse,
} from '../types/weather';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error(
        'Thiếu VITE_API_BASE_URL trong file .env',
    );
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,

    (error: AxiosError<ApiErrorResponse>) => {
        if (!error.response) {
            return Promise.reject(
                new Error(
                    'Không thể kết nối đến máy chủ thời tiết.',
                ),
            );
        }

        const status = error.response.status;
        const detail = error.response.data?.detail;
        const message = error.response.data?.message;

        /*
         * Backend hiện có thể trả HTTP 500 nhưng nội dung cho
         * biết Open-Meteo bị giới hạn 429.
         */
        const isRateLimited =
            status === 429 ||
            detail?.includes('429 Too Many Requests');

        if (isRateLimited) {
            return Promise.reject(
                new Error(
                    'Dịch vụ thời tiết đang nhận quá nhiều yêu cầu. Vui lòng thử lại sau.',
                ),
            );
        }

        return Promise.reject(
            new Error(
                detail ??
                message ??
                `Không thể tải dữ liệu thời tiết (${status}).`,
            ),
        );
    },
);

export default apiClient;