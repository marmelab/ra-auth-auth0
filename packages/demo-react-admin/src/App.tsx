import React, { useEffect, useRef, useState } from 'react';
import {
    Admin,
    Resource,
    CustomRoutes,
    AuthProvider,
    DataProvider,
} from 'react-admin';
import { Route } from 'react-router-dom';
import comments from './comments';
import CustomRouteLayout from './customRouteLayout';
import CustomRouteNoLayout from './customRouteNoLayout';
import i18nProvider from './i18nProvider';
import Layout from './Layout';
import posts from './posts';
import users from './users';
import tags from './tags';
import { Auth0AuthProvider, httpClient, Login } from 'ra-auth-auth0';
import { Auth0Client } from '@auth0/auth0-spa-js';
import jsonServerProvider from 'ra-data-json-server';

const getPermissions = (roles: String[]) => {
    if (!roles) {
        return false;
    }
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('user')) return 'user';
    return false;
};

const App = () => {
    const [auth0, setAuth0] = useState(undefined);
    const authProvider = useRef<AuthProvider>(undefined);
    const dataProvider = useRef<DataProvider>(undefined);

    useEffect(() => {
        const initAuth0Client = async () => {
            const clientAuth0 = new Auth0Client({
                domain: import.meta.env.VITE_AUTH0_DOMAIN,
                clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
                cacheLocation: 'localstorage',
                authorizationParams: {
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                },
            });

            authProvider.current = Auth0AuthProvider(clientAuth0, {
                onPermissions: getPermissions,
                loginRedirectUri: import.meta.env.VITE_LOGIN_REDIRECT_URL,
                logoutRedirectUri: import.meta.env.VITE_LOGOUT_REDIRECT_URL,
            });

            const httpClientAuth0 = await httpClient(clientAuth0);
            dataProvider.current = jsonServerProvider(
                import.meta.env.VITE_API_URL,
                httpClientAuth0
            );

            setAuth0(clientAuth0);
        };
        if (!auth0) {
            initAuth0Client();
        }
    }, [auth0]);

    if (!auth0) {
        return <div>Loading...</div>;
    }

    return (
        <Admin
            authProvider={authProvider.current}
            dataProvider={dataProvider.current}
            i18nProvider={i18nProvider}
            title="Example Admin"
            layout={Layout}
            loginPage={<Login />}
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
