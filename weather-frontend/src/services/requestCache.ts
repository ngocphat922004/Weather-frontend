const DEFAULT_CACHE_TIME =
    15 * 60 * 1000;

const MIN_REQUEST_INTERVAL =
    1200;

const STORAGE_PREFIX =
    'weather-cache:';

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

const responseCache = new Map<
    string,
    CacheEntry<unknown>
>();

const pendingRequests = new Map<
    string,
    Promise<unknown>
>();

let requestQueue:
    Promise<void> = Promise.resolve();

function normalizeCacheKey(
    key: string,
): string {
    return key.trim().toLowerCase();
}

function getStorageKey(
    key: string,
): string {
    return `${STORAGE_PREFIX}${key}`;
}

function readSessionCache<T>(
    key: string,
): CacheEntry<T> | undefined {
    if (
        typeof window === 'undefined'
    ) {
        return undefined;
    }

    try {
        const stored =
            window.sessionStorage.getItem(
                getStorageKey(key),
            );

        if (!stored) {
            return undefined;
        }

        const parsed =
            JSON.parse(
                stored,
            ) as CacheEntry<T>;

        if (
            parsed.expiresAt <=
            Date.now()
        ) {
            window.sessionStorage.removeItem(
                getStorageKey(key),
            );

            return undefined;
        }

        return parsed;
    } catch {
        return undefined;
    }
}

function writeSessionCache<T>(
    key: string,
    entry: CacheEntry<T>,
): void {
    if (
        typeof window === 'undefined'
    ) {
        return;
    }

    try {
        window.sessionStorage.setItem(
            getStorageKey(key),
            JSON.stringify(entry),
        );
    } catch {
        return;
    }
}

function removeSessionCache(
    key: string,
): void {
    if (
        typeof window === 'undefined'
    ) {
        return;
    }

    try {
        window.sessionStorage.removeItem(
            getStorageKey(key),
        );
    } catch {
        return;
    }
}

function wait(
    milliseconds: number,
): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(
            resolve,
            milliseconds,
        );
    });
}

function enqueueRequest<T>(
    request: () => Promise<T>,
): Promise<T> {
    const execute =
        async (): Promise<T> => {
            await wait(
                MIN_REQUEST_INTERVAL,
            );

            return request();
        };

    const result =
        requestQueue.then(
            execute,
            execute,
        );

    requestQueue = result.then(
        () => undefined,
        () => undefined,
    );

    return result;
}

export async function requestWithCache<T>(
    key: string,
    request: () => Promise<T>,
    cacheTime = DEFAULT_CACHE_TIME,
): Promise<T> {
    const normalizedKey =
        normalizeCacheKey(key);

    const now = Date.now();

    const memoryCache =
        responseCache.get(
            normalizedKey,
        ) as
        | CacheEntry<T>
        | undefined;

    if (
        memoryCache &&
        memoryCache.expiresAt > now
    ) {
        return memoryCache.data;
    }

    if (memoryCache) {
        responseCache.delete(
            normalizedKey,
        );

        removeSessionCache(
            normalizedKey,
        );
    }

    const sessionCache =
        readSessionCache<T>(
            normalizedKey,
        );

    if (sessionCache) {
        responseCache.set(
            normalizedKey,
            sessionCache,
        );

        return sessionCache.data;
    }

    const pendingRequest =
        pendingRequests.get(
            normalizedKey,
        ) as
        | Promise<T>
        | undefined;

    if (pendingRequest) {
        return pendingRequest;
    }

    const requestPromise =
        enqueueRequest(request)
            .then((data) => {
                const entry:
                    CacheEntry<T> = {
                    data,
                    expiresAt:
                        Date.now() +
                        cacheTime,
                };

                responseCache.set(
                    normalizedKey,
                    entry,
                );

                writeSessionCache(
                    normalizedKey,
                    entry,
                );

                return data;
            })
            .finally(() => {
                pendingRequests.delete(
                    normalizedKey,
                );
            });

    pendingRequests.set(
        normalizedKey,
        requestPromise,
    );

    return requestPromise;
}

export function clearRequestCache(
    key: string,
): void {
    const normalizedKey =
        normalizeCacheKey(key);

    responseCache.delete(
        normalizedKey,
    );

    removeSessionCache(
        normalizedKey,
    );
}

export function clearRequestCacheByPrefix(
    prefix: string,
): void {
    const normalizedPrefix =
        normalizeCacheKey(prefix);

    responseCache.forEach(
        (_, key) => {
            if (
                key.startsWith(
                    normalizedPrefix,
                )
            ) {
                responseCache.delete(key);

                removeSessionCache(
                    key,
                );
            }
        },
    );

    if (
        typeof window ===
        'undefined'
    ) {
        return;
    }

    const keysToRemove:
        string[] = [];

    for (
        let index = 0;
        index <
        window.sessionStorage.length;
        index += 1
    ) {
        const storageKey =
            window.sessionStorage.key(
                index,
            );

        if (!storageKey) {
            continue;
        }

        if (
            storageKey.startsWith(
                `${STORAGE_PREFIX}${normalizedPrefix}`,
            )
        ) {
            keysToRemove.push(
                storageKey,
            );
        }
    }

    keysToRemove.forEach(
        (storageKey) => {
            window.sessionStorage.removeItem(
                storageKey,
            );
        },
    );
}

export function clearAllRequestCache(): void {
    responseCache.clear();

    if (
        typeof window ===
        'undefined'
    ) {
        return;
    }

    const keysToRemove:
        string[] = [];

    for (
        let index = 0;
        index <
        window.sessionStorage.length;
        index += 1
    ) {
        const key =
            window.sessionStorage.key(
                index,
            );

        if (
            key?.startsWith(
                STORAGE_PREFIX,
            )
        ) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(
        (key) => {
            window.sessionStorage.removeItem(
                key,
            );
        },
    );
}