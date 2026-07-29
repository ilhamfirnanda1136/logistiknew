/**
 * Stub route helpers untuk Two-Factor Authentication.
 *
 * Fortify 2FA saat ini DINONAKTIFKAN di config/fortify.php (features kosong),
 * sehingga `php artisan wayfinder:generate` tidak membuat @/routes/two-factor.
 * File ini menjaga import starter-kit agar Vite tidak error setelah git clone.
 *
 * Jika 2FA diaktifkan kembali, hapus stub ini dan kembalikan import ke
 * `@/routes/two-factor` yang digenerate Wayfinder.
 */

type RouteDefinition = { url: string; method: 'get' | 'post' | 'delete' };
type RouteFormDefinition = { action: string; method: 'get' | 'post' };

type RouteHelper = {
    (): RouteDefinition;
    url: () => string;
    form: () => RouteFormDefinition;
};

function makeRoute(url: string, method: RouteDefinition['method'] = 'post'): RouteHelper {
    const helper = (() => ({
        url,
        method,
    })) as RouteHelper;

    helper.url = () => url;
    helper.form = () => ({
        action: url,
        // Inertia Form memakai method HTTP form-compatible
        method: method === 'get' ? 'get' : 'post',
    });

    return helper;
}

export const qrCode = makeRoute('/user/two-factor-qr-code', 'get');
export const secretKey = makeRoute('/user/two-factor-secret-key', 'get');
export const recoveryCodes = makeRoute('/user/two-factor-recovery-codes', 'get');
export const regenerateRecoveryCodes = makeRoute(
    '/user/two-factor-recovery-codes',
    'post',
);
export const enable = makeRoute('/user/two-factor-authentication', 'post');
export const disable = makeRoute('/user/two-factor-authentication', 'delete');
export const confirm = makeRoute('/user/confirmed-two-factor-authentication', 'post');
