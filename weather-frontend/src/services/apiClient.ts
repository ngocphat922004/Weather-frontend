import axios, {
    AxiosError,
    type AxiosResponse,
} from 'axios';

import type {
    ApiErrorResponse,
} from '../types/weather';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.trim();

if (!API_BASE_URL) {
    throw new Error(
        'Thiếu VITE_API_BASE_URL trong file .env',
    );
}

const apiClient = axios.create({
    baseURL: API_BASE_URL.replace(/\/+$/, ''),
    timeout: 90000,

    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

/*
 * Chỉ xử lý response và chuẩn hóa lỗi.
 * Không tự động retry để tránh gửi request liên tục.
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,

    (error: AxiosError<ApiErrorResponse>) => {
        if (axios.isCancel(error)) {
            return Promise.reject(error);
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

        const detail =
            typeof responseData?.detail === 'string'
                ? responseData.detail
                : undefined;

        const message =
            typeof responseData?.message === 'string'
                ? responseData.message
                : undefined;

        /*
         * Backend đôi khi trả HTTP 500 nhưng nội dung thực tế
         * là Open-Meteo đang giới hạn request 429.
         */
        const isRateLimited =
            status === 429 ||
            detail?.includes('429') ||
            detail
                ?.toLowerCase()
                .includes('too many requests') ||
            message?.includes('429') ||
            message
                ?.toLowerCase()
                .includes('too many requests');

        if (isRateLimited) {
            return Promise.reject(
                new Error(
                    'Dịch vụ thời tiết đang nhận quá nhiều yêu cầu. Vui lòng chờ vài phút rồi thử lại.',
                ),
            );
        }

        if (status === 404) {
            return Promise.reject(
                new Error(
                    'Không tìm thấy dữ liệu cho thành phố đã chọn.',
                ),
            );
        }

        if (status === 422) {
            return Promise.reject(
                new Error(
                    detail ??
                    'Tên thành phố hoặc tham số tìm kiếm không hợp lệ.',
                ),
            );
        }

        if (status >= 500) {
            return Promise.reject(
                new Error(
                    detail ??
                    message ??
                    'Máy chủ thời tiết đang gặp sự cố. Vui lòng thử lại sau.',
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