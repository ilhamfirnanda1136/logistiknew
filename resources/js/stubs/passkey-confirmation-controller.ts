/**
 * Stub PasskeyConfirmationController actions.
 * Passkeys Fortify dinonaktifkan — Wayfinder tidak generate file ini.
 */

type RouteDefinition = { url: string; method: 'get' | 'post' };

type RouteHelper = {
    (): RouteDefinition;
    url: () => string;
    form: () => { action: string; method: 'get' | 'post' };
};

function makeRoute(url: string, method: RouteDefinition['method']): RouteHelper {
    const helper = (() => ({
        url,
        method,
    })) as RouteHelper;

    helper.url = () => url;
    helper.form = () => ({ action: url, method });

    return helper;
}

export const index = makeRoute('/user/confirm-passkey', 'get');
export const store = makeRoute('/user/confirm-passkey', 'post');

const PasskeyConfirmationController = { index, store };
export default PasskeyConfirmationController;
