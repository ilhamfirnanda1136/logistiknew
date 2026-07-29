/**
 * Stub reset/forgot password routes.
 * Features::resetPasswords() dimatikan di config/fortify.php.
 * Route password.confirm tetap digenerate Wayfinder di @/routes/password/confirm.
 */

type RouteDefinition = { url: string; method: 'get' | 'post' };
type RouteFormDefinition = { action: string; method: 'get' | 'post' };

type RouteHelper = {
    (): RouteDefinition;
    url: () => string;
    form: () => RouteFormDefinition;
};

function makeRoute(url: string, method: RouteDefinition['method'] = 'post'): RouteHelper {
    const helper = (() => ({ url, method })) as RouteHelper;
    helper.url = () => url;
    helper.form = () => ({ action: url, method });
    return helper;
}

/** POST /forgot-password — kirim link reset */
export const email = makeRoute('/forgot-password', 'post');

/** POST /reset-password — simpan password baru */
export const update = makeRoute('/reset-password', 'post');

/** GET /forgot-password — form request link */
export const request = makeRoute('/forgot-password', 'get');

/** GET /reset-password/{token} — form reset */
export const reset = makeRoute('/reset-password/{token}', 'get');
