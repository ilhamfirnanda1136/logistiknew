export function getCsrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

export interface ApiError {
    message?: string;
    errors?: Record<string, string[]>;
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers ?? {}),
        },
    });

    if (!response.ok) {
        const err: ApiError = await response.json().catch(() => ({}));
        const error = new Error(response.statusText) as Error & { status: number; data: ApiError };
        error.status = response.status;
        error.data = err;
        throw error;
    }

    if (response.status === 204) return undefined as T;
    
    const text = await response.text();
    try {
        return (text ? JSON.parse(text) : undefined) as T;
    } catch {
        return undefined as T;
    }
}

export function apiGet<T>(url: string, params: Record<string, unknown> = {}): Promise<T> {
    const query = new URLSearchParams(
        Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)]),
    ).toString();
    return apiFetch<T>(query ? `${url}?${query}` : url);
}

export function apiPost<T>(url: string, body: unknown): Promise<T> {
    return apiFetch<T>(url, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut<T>(url: string, body: unknown): Promise<T> {
    return apiFetch<T>(url, { method: 'PUT', body: JSON.stringify(body) });
}

export function apiDelete<T>(url: string): Promise<T> {
    return apiFetch<T>(url, { method: 'DELETE' });
}
