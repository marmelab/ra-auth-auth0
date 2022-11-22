# ra-auth-auth0

An auth provider for [react-admin](https://github.com/marmelab/react-admin) which handles authentication via a [Auth0](https://auth0.com) instance.

This package provides:

-   A `Auth0AuthProvider` for react-admin

## Installation

```sh
yarn add ra-auth-auth0
# or
npm install --save ra-auth-auth0
```

## Example usage

```jsx
// in src/App.tsx
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
import i18nProvider from './i18nProvider';
import Layout from './Layout';
import posts from './posts';
import users from './users';
import tags from './tags';
import { Auth0AuthProvider, httpClient } from 'ra-auth-auth0';
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
    const authProvider = useRef < AuthProvider > undefined;
    const dataProvider = useRef < DataProvider > undefined;

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

    return (
        <Admin
            authProvider={authProvider.current}
            dataProvider={dataProvider.current}
            i18nProvider={i18nProvider}
            title="Example Admin"
            layout={Layout}
        >
            {permissions => (
                <>
                    <Resource name="posts" {...posts} />
                    <Resource name="comments" {...comments} />
                    <Resource name="tags" {...tags} />
                    {permissions === 'admin' ? (
                        <Resource name="users" {...users} />
                    ) : null}
                </>
            )}
        </Admin>
    );
};
export default App;
```

## `Auth0AuthProvider` Parameters

-   `onPermissions` - _optional_ - function used to transform the roles fetched from Auth0 into a permissions object in the form of what your react-admin app expects
-   `loginRedirectUri` - _optional_ - URI used to override the redirect URI after successful login
-   `logoutRedirectUri` - _optional_ - URI used to override the redirect URI after successful logout

## Demo

You can find a working demo, along with the source code, in this project's repository: https://github.com/marmelab/ra-auth-auth0

## License

This auth provider is licensed under the MIT License and sponsored by [marmelab](https://marmelab.com).
