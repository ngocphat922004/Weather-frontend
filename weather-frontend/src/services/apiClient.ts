import axios, {
    AxiosError,
    type AxiosResponse,
} from 'axios';

import type {
    ApiErrorResponse,
    ValidationErrorItem,
} from '../types/weather';

const DEFAULT_API_BASE_URL =
    'https://weather-backend-0n6d.onrender.com';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    DEFAULT_API_BASE_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL.replace(/\/+$/, ''),
    timeout: 90000,
    headers: {
        Accept: 'application/json',
    },
});

function getValidationMessage(
    detail: ValidationErrorItem[],
): string {
    const firstError = detail[0];

    if (!firstError) {
        return 'Dữ liệu gửi lên không hợp lệ.';
    }

    const field = firstError.loc
        .filter(
            (part) =>
                part !== 'body' &&
                part !== 'query' &&
                part !== 'path',
        )
        .join('.');

    return field
        ? `${field}: ${firstError.msg}`
        : firstError.msg;
}

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,

    (error: AxiosError<ApiErrorResponse>) => {
        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }

        if (error.code === 'ECONNABORTED') {
            return Promise.reject(
                new Error(
                    'Máy chủ phản hồi quá lâu. Vui lòng thử lại sau.',
                ),
            );
        }

        if (!error.response) {
            return Promise.reject(
                new Error(
                    'Không thể kết nối đến máy chủ thời tiết. Vui lòng kiểm tra kết nối và thử lại.',
                ),
            );
        }

        const status = error.response.status;
        const responseData = error.response.data;

        const detail = responseData?.detail;

        const detailMessage =
            typeof detail === 'string'
                ? detail
                : Array.isArray(detail)
                    ? getValidationMessage(detail)
                    : undefined;

        const message =
            typeof responseData?.message === 'string'
                ? responseData.message
                : undefined;

        const normalizedError =
            `${detailMessage ?? ''} ${message ?? ''}`
                .toLowerCase();

        const isRateLimited =
            status === 429 ||
            normalizedError.includes('429') ||
            normalizedError.includes(
                'too many requests',
            ) ||
            normalizedError.includes(
                'rate limit',
            );

        if (isRateLimited) {
            return Promise.reject(
                new Error(
                    'Dịch vụ thời tiết đang nhận quá nhiều yêu cầu. Vui lòng chờ rồi thử lại.',
                ),
            );
        }

        if (status === 404) {
            return Promise.reject(
                new Error(
                    detailMessage ??
                    message ??
                    'Không tìm thấy dữ liệu cho thành phố đã chọn.',
                ),
            );
        }

        if (status === 422) {
            return Promise.reject(
                new Error(
                    detailMessage ??
                    message ??
                    'Tên thành phố hoặc dữ liệu gửi lên không hợp lệ.',
                ),
            );
        }

        if (status >= 500) {
            return Promise.reject(
                new Error(
                    detailMessage ??
                    message ??
                    'Máy chủ thời tiết đang gặp sự cố. Vui lòng thử lại sau.',
                ),
            );
        }

        return Promise.reject(
            new Error(
                detailMessage ??
                message ??
                `Không thể tải dữ liệu thời tiết (${status}).`,
            ),
        );
    },
);

export default apiClient;