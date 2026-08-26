const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

/*
 * Lưu kết quả đã tải thành công.
 */
const responseCache = new Map<
    string,
    CacheEntry<unknown>
>();

/*
 * Lưu Promise đang chạy để nhiều component không gửi
 * trùng cùng một request.
 */
const pendingRequests = new Map<
    string,
    Promise<unknown>
>();

function normalizeCacheKey(key: string): string {
    return key.trim().toLowerCase();
}

export async function requestWithCache<T>(
    key: string,
    request: () => Promise<T>,
    cacheTime = DEFAULT_CACHE_TIME,
): Promise<T> {
    const normalizedKey = normalizeCacheKey(key);
    const now = Date.now();

    const cachedEntry =
        responseCache.get(normalizedKey) as
        | CacheEntry<T>
        | undefined;

    /*
     * Trả dữ liệu cache nếu vẫn còn hiệu lực.
     */
    if (
        cachedEntry &&
        cachedEntry.expiresAt > now
    ) {
        return cachedEntry.data;
    }

    /*
     * Xóa cache đã hết hạn.
     */
    if (cachedEntry) {
        responseCache.delete(normalizedKey);
    }

    /*
     * Nếu request giống nhau đang chạy, sử dụng lại Promise
     * thay vì gửi thêm request mới.
     */
    const pendingRequest =
        pendingRequests.get(normalizedKey) as
        | Promise<T>
        | undefined;

    if (pendingRequest) {
        return pendingRequest;
    }

    const requestPromise = request()
        .then((data) => {
            responseCache.set(normalizedKey, {
                data,
                expiresAt: Date.now() + cacheTime,
            });

            return data;
        })
        .finally(() => {
            pendingRequests.delete(normalizedKey);
        });

    pendingRequests.set(
        normalizedKey,
        requestPromise,
    );

    return requestPromise;
}

/*
 * Xóa cache của một request cụ thể.
 */
export function clearRequestCache(
    key: string,
): void {
    responseCache.delete(
        normalizeCacheKey(key),
    );
}

/*
 * Xóa các cache bắt đầu bằng một nhóm khóa.
 *
 * Ví dụ:
 * clearRequestCacheByPrefix('weather:')
 */
export function clearRequestCacheByPrefix(
    prefix: string,
): void {
    const normalizedPrefix =
        normalizeCacheKey(prefix);

    responseCache.forEach((_, key) => {
        if (key.startsWith(normalizedPrefix)) {
            responseCache.delete(key);
        }
    });
}

/*
 * Xóa toàn bộ dữ liệu cache.
 * Không hủy các request đang chạy.
 */
export function clearAllRequestCache(): void {
    responseCache.clear();
}