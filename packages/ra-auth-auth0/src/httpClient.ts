import { fetchUtils } from 'ra-core';

/**
 * An httpClient that adds authentication headers needed by Auth0 in all requests.
 * @param auth0Client the Auth0 client.
 * @returns a function with the same definition as `httpClient` that adds an `Authorization` header containing the Auth0 token.
 */
export const httpClient = (auth0Client: any) => async (
    url: any,
    options: fetchUtils.Options | undefined
) => {
    const token = await auth0Client.getTokenSilently();
    const requestHeaders = getAuth0Headers(token, options);
    return fetchUtils.fetchJson(url, {
        ...options,
        headers: requestHeaders,
    });
};

/**
 * Return the headers needed by Auth0.
 * @param token the Auth0 token
 * @param options the fetch options (so that we do not override other headers)
 * @returns the headers needed by Auth0
 */
export const getAuth0Headers = (
    token: string | null,
    options: fetchUtils.Options | undefined
): Headers => {
    const headers = ((options && options.headers) ||
        new Headers({
            Accept: 'application/json',
        })) as Headers;
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
};
