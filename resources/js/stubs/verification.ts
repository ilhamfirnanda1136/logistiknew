/**
 * Stub email verification routes.
 * Features::emailVerification() dimatikan di config/fortify.php.
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

export const send = makeRoute('/email/verification-notification', 'post');
export const notice = makeRoute('/email/verify', 'get');
export const verify = makeRoute('/email/verify/{id}/{hash}', 'get');
