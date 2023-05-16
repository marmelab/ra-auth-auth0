import { AuthProvider, PreviousLocationStorageKey } from 'ra-core';
import { Auth0Client } from '@auth0/auth0-spa-js';

/**
 * An authProvider which handles authentication via the Auth0 instance.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { Admin, Resource } from 'react-admin';
 * import { Auth0AuthProvider } from 'ra-auth-auth0';
 * import { Auth0Client } from '@auth0/auth0-spa-js';
 * import dataProvider from './dataProvider';
 * import posts from './posts';
 *
 * const clientAuth0 = new Auth0Client({
 *    domain: 'your-domain.auth0.com',
 *    clientId: 'your-client-id',
 *    cacheLocation: 'localstorage',
 *    // optional
 *    authorizationParams: {
 *        audience: 'https://your-domain.auth0.com/api/v2/',
 *    },
 * });
 *
 * const authProvider = Auth0AuthProvider(clientAuth0, {
 *     loginRedirectUri: 'http://localhost:3000/auth-callback',
 * });
 *
 *  const App = () => {
 *   return (
 *        <Admin
 *            authProvider={authProvider}
 *            dataProvider={dataProvider}
 *            title="Example Admin"
 *         >
 *             <Resource name="posts" {...posts} />
 *       </Admin>
 *    );
 * };
 * export default App;
 *
 * ```
 *
 * @param client the Auth0 client
 * @param options The authProvider options
 * @param options.loginRedirectUri The URI to which users should be redirected after they signed in. Must be whitelisted in the Auth0 application settings.
 * @param options.logoutRedirectUri The URI to which users should be redirected after they signed out. Must be whitelisted in the Auth0 application settings.
 * @param options.redirectOnCheckAuth If true, the user will be redirected to Auth0 when checkAuth fails. Defaults to true.
 * @returns an authProvider ready to be used by React-Admin.
 */
export const Auth0AuthProvider = (
    client: Auth0Client,
    {
        loginRedirectUri,
        logoutRedirectUri,
        redirectOnCheckAuth = true,
    }: {
        loginRedirectUri?: string;
        logoutRedirectUri?: string;
        redirectOnCheckAuth?: boolean;
    } = {
        redirectOnCheckAuth: true,
    }
): AuthProvider => ({
    // Used when the redirection to Auth0 is done from a custom login page
    async login() {
        client.loginWithRedirect({
            authorizationParams: {
                redirect_uri:
                    loginRedirectUri ??
                    `${window.location.origin}/auth-callback`,
            },
        });
    },
    // called when the user clicks on the logout button
    async logout() {
        return client
            .logout({
                logoutParams: {
                    returnTo: logoutRedirectUri || window.location.origin,
                },
            })
            .then(() => logoutRedirectUri || '/');
    },
    // called when the API returns an error
    async checkError({ status }) {
        if (status === 401 || status === 403) {
            throw new Error('Unauthorized');
        }
    },
    // called when the user navigates to a new location, to check for authentication
    async checkAuth() {
        const isAuthenticated = await client.isAuthenticated();
        if (isAuthenticated) {
            return;
        }

        if (redirectOnCheckAuth) {
            localStorage.setItem(
                PreviousLocationStorageKey,
                window.location.href
            );
            return client.loginWithRedirect({
                authorizationParams: {
                    redirect_uri:
                        loginRedirectUri ??
                        `${window.location.origin}/auth-callback`,
                },
            });
        }
        throw new Error('Unauthorized');
    },
    // called when the user navigates to a new location, to check for permissions / roles
    async getPermissions() {
        if (!(await client.isAuthenticated())) {
            return;
        }

        // If Auth0 instance contains rules for returning permissions, use them
        const claims = await client.getIdTokenClaims();
        const roleProperty = Object.keys(claims).find(key =>
            key.includes('role')
        );
        return claims[roleProperty];
    },
    async getIdentity() {
        if (await client.isAuthenticated()) {
            const user = await client.getUser();
            return {
                id: user.email,
                fullName: user.name,
                avatar: user.picture,
            };
        }
        throw new Error('Failed to get identity.');
    },
    async handleCallback() {
        const query = window.location.search;
        if (query.includes('code=') && query.includes('state=')) {
            try {
                await client.handleRedirectCallback();
                return;
            } catch (error) {
                throw { redirectTo: false, message: error.message };
            }
        }
        throw new Error('Failed to handle login callback.');
    },
});
