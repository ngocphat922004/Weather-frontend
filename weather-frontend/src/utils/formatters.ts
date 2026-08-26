import type {
    JsonObject,
    JsonValue,
} from '../types/weather';

export function toNumber(
    value: unknown,
    fallback = 0,
): number {
    if (
        typeof value === 'number' &&
        Number.isFinite(value)
    ) {
        return value;
    }

    if (
        typeof value === 'string' &&
        value.trim() !== ''
    ) {
        const parsedValue = Number(value);

        if (Number.isFinite(parsedValue)) {
            return parsedValue;
        }
    }

    return fallback;
}

export function toText(
    value: unknown,
    fallback = '—',
): string {
    if (typeof value === 'string') {
        const normalizedValue = value.trim();

        return normalizedValue || fallback;
    }

    if (
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return String(value);
    }

    return fallback;
}

export function asObject(
    value: unknown,
): JsonObject {
    if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    ) {
        return value as JsonObject;
    }

    return {};
}

export function asArray(
    value: unknown,
): JsonValue[] {
    return Array.isArray(value)
        ? (value as JsonValue[])
        : [];
}

export function getNestedValue(
    source: unknown,
    path: string,
): JsonValue | undefined {
    const keys = path
        .split('.')
        .filter(Boolean);

    let currentValue: unknown = source;

    for (const key of keys) {
        if (
            typeof currentValue !== 'object' ||
            currentValue === null ||
            Array.isArray(currentValue)
        ) {
            return undefined;
        }

        currentValue = (
            currentValue as Record<
                string,
                unknown
            >
        )[key];
    }

    return currentValue as
        | JsonValue
        | undefined;
}

export function getFirstValue(
    source: unknown,
    paths: string[],
): JsonValue | undefined {
    for (const path of paths) {
        const value = getNestedValue(
            source,
            path,
        );

        if (
            value !== undefined &&
            value !== null &&
            value !== ''
        ) {
            return value;
        }
    }

    return undefined;
}

export function formatNumber(
    value: unknown,
    maximumFractionDigits = 0,
): string {
    const numberValue = toNumber(
        value,
        Number.NaN,
    );

    if (Number.isNaN(numberValue)) {
        return '—';
    }

    return new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits,
    }).format(numberValue);
}

export function formatTemperature(
    value: unknown,
    maximumFractionDigits = 0,
): string {
    const formattedValue = formatNumber(
        value,
        maximumFractionDigits,
    );

    return formattedValue === '—'
        ? formattedValue
        : `${formattedValue}°C`;
}

export function formatPercentage(
    value: unknown,
    maximumFractionDigits = 0,
): string {
    const formattedValue = formatNumber(
        value,
        maximumFractionDigits,
    );

    return formattedValue === '—'
        ? formattedValue
        : `${formattedValue}%`;
}

export function formatWindSpeed(
    value: unknown,
    maximumFractionDigits = 0,
): string {
    const formattedValue = formatNumber(
        value,
        maximumFractionDigits,
    );

    return formattedValue === '—'
        ? formattedValue
        : `${formattedValue} km/h`;
}

export function formatRainfall(
    value: unknown,
    maximumFractionDigits = 1,
): string {
    const formattedValue = formatNumber(
        value,
        maximumFractionDigits,
    );

    return formattedValue === '—'
        ? formattedValue
        : `${formattedValue} mm`;
}

export function formatDate(
    value: unknown,
    options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    },
): string {
    if (
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        !(value instanceof Date)
    ) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat(
        'vi-VN',
        options,
    ).format(date);
}

export function formatTime(
    value: unknown,
): string {
    return formatDate(value, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

export function formatShortDate(
    value: unknown,
): string {
    return formatDate(value, {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
    });
}

export function capitalizeFirst(
    value: unknown,
): string {
    const textValue = toText(value, '');

    if (!textValue) {
        return '—';
    }

    return (
        textValue.charAt(0).toUpperCase() +
        textValue.slice(1)
    );
}

export function getWeatherDescription(
    weatherCode: unknown,
): string {
    const code = toNumber(
        weatherCode,
        Number.NaN,
    );

    if (Number.isNaN(code)) {
        return 'Chưa xác định';
    }

    if (code === 0) {
        return 'Trời quang';
    }

    if ([1, 2, 3].includes(code)) {
        return 'Có mây';
    }

    if ([45, 48].includes(code)) {
        return 'Có sương mù';
    }

    if (
        [51, 53, 55, 56, 57].includes(code)
    ) {
        return 'Mưa phùn';
    }

    if (
        [61, 63, 65, 66, 67].includes(code)
    ) {
        return 'Có mưa';
    }

    if ([71, 73, 75, 77].includes(code)) {
        return 'Có tuyết';
    }

    if ([80, 81, 82].includes(code)) {
        return 'Mưa rào';
    }

    if ([85, 86].includes(code)) {
        return 'Mưa tuyết';
    }

    if ([95, 96, 99].includes(code)) {
        return 'Có giông';
    }

    return 'Thời tiết thay đổi';
}