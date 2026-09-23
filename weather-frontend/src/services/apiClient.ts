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

const configuredTimeout = Number(
    import.meta.env.VITE_API_TIMEOUT_MS,
);

const API_TIMEOUT_MS =
    Number.isFinite(configuredTimeout) &&
        configuredTimeout > 0
        ? configuredTimeout
        : 12000;

export class WeatherApiError extends Error {
    readonly status?: number;
    readonly code?: string;

    constructor(
        message: string,
        options: {
            status?: number;
            code?: string;
        } = {},
    ) {
        super(message);
        this.name = 'WeatherApiError';
        this.status = options.status;
        this.code = options.code;
    }
}

export function isWeatherApiUnavailableError(
    error: unknown,
): boolean {
    if (!(error instanceof WeatherApiError)) {
        return false;
    }

    if (error.status === undefined) {
        return true;
    }

    return (
        error.status === 408 ||
        error.status === 429 ||
        error.status >= 500
    );
}

const apiClient = axios.create({
    baseURL: API_BASE_URL.replace(/\/+$/, ''),
    timeout: API_TIMEOUT_MS,
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
                new WeatherApiError(
                    'Máy chủ phản hồi quá lâu. Vui lòng thử lại sau.',
                    {
                        code: error.code,
                    },
                ),
            );
        }

        if (!error.response) {
            return Promise.reject(
                new WeatherApiError(
                    'Không thể kết nối đến máy chủ thời tiết. Vui lòng kiểm tra kết nối và thử lại.',
                    {
                        code: error.code,
                    },
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
                new WeatherApiError(
                    'Dịch vụ thời tiết đang nhận quá nhiều yêu cầu. Vui lòng chờ rồi thử lại.',
                    {
                        status: 429,
                        code: error.code,
                    },
                ),
            );
        }

        if (status === 404) {
            return Promise.reject(
                new WeatherApiError(
                    detailMessage ??
                    message ??
                    'Không tìm thấy dữ liệu cho thành phố đã chọn.',
                    {
                        status,
                        code: error.code,
                    },
                ),
            );
        }

        if (status === 422) {
            return Promise.reject(
                new WeatherApiError(
                    detailMessage ??
                    message ??
                    'Tên thành phố hoặc dữ liệu gửi lên không hợp lệ.',
                    {
                        status,
                        code: error.code,
                    },
                ),
            );
        }

        if (status >= 500) {
            return Promise.reject(
                new WeatherApiError(
                    detailMessage ??
                    message ??
                    'Máy chủ thời tiết đang gặp sự cố. Vui lòng thử lại sau.',
                    {
                        status,
                        code: error.code,
                    },
                ),
            );
        }

        return Promise.reject(
            new WeatherApiError(
                detailMessage ??
                message ??
                `Không thể tải dữ liệu thời tiết (${status}).`,
                {
                    status,
                    code: error.code,
                },
            ),
        );
    },
);

export default apiClient;