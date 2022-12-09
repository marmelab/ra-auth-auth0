import { AuthProvider, PreviousLocationStorageKey } from 'react-admin';
import { Auth0Client } from '@auth0/auth0-spa-js';

/**
 * An authProvider which handles authentication via the Auth0 instance.
 *
 * @example
 * ```tsx
 * import React, { useEffect, useRef, useState } from 'react';
 * import {
 *    Admin,
 *    Resource,
 *    CustomRoutes,
 *    AuthProvider,
 *    DataProvider,
 * } from 'react-admin';
 * import { Route } from 'react-router-dom';
 * import comments from './comments';
 * import i18nProvider from './i18nProvider';
 * import Layout from './Layout';
 * import posts from './posts';
 * import users from './users';
 * import tags from './tags';
 * import { Auth0AuthProvider, httpClient } from 'ra-auth-auth0';
 * import { Auth0Client } from '@auth0/auth0-spa-js';
 * import jsonServerProvider from 'ra-data-json-server';
 *
 * const getPermissions = (roles: String[]) => {
 *    if (!roles) {
 *        return false;
 *    }
 *    if (roles.includes('admin')) return 'admin';
 *    if (roles.includes('user')) return 'user';
 *    return false;
 * };
 *
 *  const App = () => {
 *    const [auth0, setAuth0] = useState(undefined);
 *    const authProvider = useRef<AuthProvider>(undefined);
 *    const dataProvider = useRef<DataProvider>(undefined);
 *
 *    useEffect(() => {
 *        const initAuth0Client = async () => {
 *           const clientAuth0 = new Auth0Client({
 *              domain: import.meta.env.VITE_AUTH0_DOMAIN,
 *              clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
 *              cacheLocation: 'localstorage',
 *              authorizationParams: {
 *                  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
 *              },
 *          });
 *
 *          authProvider.current = Auth0AuthProvider(clientAuth0, {
 *              onPermissions: getPermissions,
 *              loginRedirectUri: import.meta.env.VITE_LOGIN_REDIRECT_URL,
 *              logoutRedirectUri: import.meta.env.VITE_LOGOUT_REDIRECT_URL,
 *          });
 *
 *          const httpClientAuth0 = await httpClient(clientAuth0);
 *          dataProvider.current = jsonServerProvider(
 *              import.meta.env.VITE_API_URL,
 *              httpClientAuth0
 *          );
 *
 *          setAuth0(clientAuth0);
 *       };
 *       if (!auth0) {
 *          initAuth0Client();
 *       }
 *    }, [auth0]);
 *
 *   if (!auth0) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   return (
 *        <Admin
 *            authProvider={authProvider.current}
 *            dataProvider={dataProvider.current}
 *            i18nProvider={i18nProvider}
 *            title="Example Admin"
 *            layout={Layout}
 *         >
 *           {permissions => (
 *               <>
 *                   <Resource name="posts" {...posts} />
 *                   <Resource name="comments" {...comments} />
 *                   <Resource name="tags" {...tags} />
 *                   {permissions === 'admin' ? (
 *                       <Resource name="users" {...users} />
 *                   ) : null}
 *               </>
 *           )}
 *       </Admin>
 *    );
 * };
 * export default App;
 *
 * ```
 *
 * @param client the Auth0 client *
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
                redirect_uri: `${window.location.origin}/auth-callback`,
            },
        });
    },
    // called when the user clicks on the logout button
    async logout() {
        const isAuthenticated = await client.isAuthenticated();
        if (isAuthenticated) {
            // need to check for this as react-admin calls logout in case checkAuth failed
            return client.logout({
                logoutParams: {
                    returnTo: logoutRedirectUri || window.location.origin,
                },
            });
        }
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
            client.loginWithRedirect({
                authorizationParams: {
                    redirect_uri: `${window.location.origin}/auth-callback`,
                },
            });
        }
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
                console.log('error', error);
                throw error;
            }
        }
        throw new Error('Failed to handle login callback.');
    },
});
