/**
 * Stub PasskeyRegistrationController actions.
 * Passkeys Fortify dinonaktifkan — Wayfinder tidak generate file ini.
 * Dipakai agar Vite tidak error setelah git clone.
 */

type RouteDefinition = { url: string; method: 'get' | 'post' | 'delete' };

type DestroyHelper = {
    (id: number | string): RouteDefinition;
    url: (id: number | string) => string;
    form: (id: number | string) => { action: string; method: 'post' };
};

export const destroy: DestroyHelper = ((id: number | string) => ({
    url: destroy.url(id),
    method: 'delete' as const,
})) as DestroyHelper;

destroy.url = (id: number | string) => `/passkeys/${id}`;
destroy.form = (id: number | string) => ({
    action: destroy.url(id),
    method: 'post',
});

const PasskeyRegistrationController = { destroy };
export default PasskeyRegistrationController;
