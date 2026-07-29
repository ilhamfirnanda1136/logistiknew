/**
 * Stub route login challenge 2FA — lihat catatan di ./two-factor.ts
 */

type RouteDefinition = { url: string; method: 'get' | 'post' };
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
        method,
    });

    return helper;
}

export const store = makeRoute('/two-factor-challenge', 'post');
