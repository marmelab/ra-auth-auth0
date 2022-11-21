import React from 'react';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import comments from './comments';
import CustomRouteLayout from './customRouteLayout';
import CustomRouteNoLayout from './customRouteNoLayout';
import dataProvider from './dataProvider';
import i18nProvider from './i18nProvider';
import Layout from './Layout';
import posts from './posts';
import users from './users';
import tags from './tags';
import { Auth0AuthProvider } from 'ra-auth0';
import { Auth0Client } from '@auth0/auth0-spa-js';

const getPermissions = (roles: String[]) => {
    if (!roles) {
        return false;
    }
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('user')) return 'user';
    return false;
};

const App = () => {
    const clientAuth0 = new Auth0Client({
        domain: import.meta.env.VITE_AUTH0_DOMAIN,
        clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
        cacheLocation: 'localstorage',
        authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
    });

    const authProvider = Auth0AuthProvider(clientAuth0, {
        onPermissions: getPermissions,
        loginRedirectUri: import.meta.env.VITE_LOGIN_REDIRECT_URL,
        logoutRedirectUri: import.meta.env.VITE_LOGOUT_REDIRECT_URL,
    });

    return (
        <Admin
            authProvider={authProvider}
            dataProvider={dataProvider}
            i18nProvider={i18nProvider}
            title="Example Admin"
            layout={Layout}
        >
            {permissions => (
                <>
                    <CustomRoutes noLayout>
                        <Route
                            path="/custom"
                            element={
                                <CustomRouteNoLayout title="Posts from /custom" />
                            }
                        />
                    </CustomRoutes>
                    <Resource name="posts" {...posts} />
                    <Resource name="comments" {...comments} />
                    <Resource name="tags" {...tags} />
                    {permissions ? (
                        <>
                            {permissions === 'admin' ? (
                                <Resource name="users" {...users} />
                            ) : null}
                            <CustomRoutes noLayout>
                                <Route
                                    path="/custom1"
                                    element={
                                        <CustomRouteNoLayout title="Posts from /custom1" />
                                    }
                                />
                            </CustomRoutes>
                            <CustomRoutes>
                                <Route
                                    path="/custom2"
                                    element={
                                        <CustomRouteLayout title="Posts from /custom2" />
                                    }
                                />
                            </CustomRoutes>
                        </>
                    ) : null}
                    <CustomRoutes>
                        <Route
                            path="/custom3"
                            element={
                                <CustomRouteLayout title="Posts from /custom3" />
                            }
                        />
                    </CustomRoutes>
                </>
            )}
        </Admin>
    );
};
export default App;
