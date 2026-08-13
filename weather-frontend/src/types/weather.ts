/**
 * Cấu trúc lỗi do FastAPI trả về.
 */
export interface ApiErrorResponse {
    detail?: string;
    message?: string;
}

/**
 * Tham số dùng khi gọi API theo thành phố.
 */
export interface WeatherCityParams {
    city: string;
}

/**
 * Swagger của backend hiện chưa khai báo schema response.
 *
 * Sử dụng unknown để buộc frontend kiểm tra response thật
 * trước khi đọc dữ liệu, tránh tự đoán sai tên thuộc tính.
 */
export type CurrentWeatherApiResponse = unknown;

export type Weather15DaysApiResponse = unknown;