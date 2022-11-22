import { AuthProvider } from 'react-admin';

export type PermissionsFunction = (roles: String[]) => any;

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
    client: any,
    options: {
        onPermissions?: PermissionsFunction;
        loginRedirectUri?: string;
        logoutRedirectUri?: string;
    } = {}
): AuthProvider => ({
    // called when the user attempts to log in. Empty in our case, as we use the Auth0 login page
    async login() {},
    // called when the user clicks on the logout button
    logout: () => {
        return client.isAuthenticated().then(function (isAuthenticated) {
            if (isAuthenticated) {
                // need to check for this as react-admin calls logout in case checkAuth failed
                return client.logout({
                    returnTo:
                        options.logoutRedirectUri || window.location.origin,
                });
            }
            return Promise.resolve();
        });
    },
    // called when the API returns an error
    checkError: ({ status }) => {
        if (status === 401 || status === 403) {
            return Promise.reject();
        }
        return Promise.resolve();
    },
    // called when the user navigates to a new location, to check for authentication
    async checkAuth() {
        const isAuthenticated = await client.isAuthenticated();

        if (isAuthenticated) {
            return Promise.resolve();
        }

        // If we have query parameters, we are in the callback phase of the Auth0 flow
        const query = window.location.search;
        if (query.includes('code=') && query.includes('state=')) {
            try {
                await client.handleRedirectCallback(); // For some mysterious reason, this call return "Invalid state" at the first call
                // remove query params from url and reload
                window.history.replaceState({}, document.title, '/');
                // Reload the page to get the user info
                window.location.reload();
                return Promise.resolve();
            } catch (error) {
                console.log('error', error);
                return Promise.resolve(false);
            }
        }

        // If we are not authenticated, redirect to Auth0 login page
        return client.loginWithRedirect({
            authorizationParams: {
                redirect_uri:
                    options.loginRedirectUri || window.location.origin,
            },
        });
    },
    // called when the user navigates to a new location, to check for permissions / roles
    async getPermissions() {
        if (!(await client.isAuthenticated())) {
            return Promise.resolve(false);
        }

        // If Auth0 instance contains rules for returning permissions, use them
        const claims = await client.getIdTokenClaims();
        const roleProperty = Object.keys(claims).find(key =>
            key.includes('role')
        );
        const roles = claims[roleProperty];
        return Promise.resolve(
            options.onPermissions ? options.onPermissions(roles) : roles
        );
    },
    async getIdentity() {
        if (await client.isAuthenticated()) {
            const user = await client.getUser();
            return Promise.resolve({ id: user.email, fullName: user.name });
        }
        return Promise.reject('Failed to get identity.');
    },
});
