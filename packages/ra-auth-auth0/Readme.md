# ra-auth-auth0

An auth provider for [react-admin](https://github.com/marmelab/react-admin) which handles authentication via a [Auth0](https://auth0.com) instance.

This package provides:

-   An `Auth0AuthProvider` for react-admin

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
import { Admin, Resource } from 'react-admin';
import { BrowserRouter } from 'react-router-dom';
import { Auth0AuthProvider } from 'ra-auth-auth0';
import { Auth0Client } from '@auth0/auth0-spa-js';
import dataProvider from './dataProvider';
import posts from './posts';

const auth0 = new Auth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    cacheLocation: 'localstorage',
    authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    },
});

const authProvider = Auth0AuthProvider(auth0, {
    loginRedirectUri: import.meta.env.VITE_LOGIN_REDIRECT_URL,
    logoutRedirectUri: import.meta.env.VITE_LOGOUT_REDIRECT_URL,
});

const App = () => {
    return (
        <BrowserRouter>
            <Admin authProvider={authProvider} dataProvider={dataProvider}>
                <Resource name="posts" {...posts} />
            </Admin>
        </BrowserRouter>
    );
};
export default App;
```

**Note:** You need to wrap your app in a [`BrowserRouter`](https://reactrouter.com/en/6/router-components/browser-router) component from `react-router-dom` for the `Auth0AuthProvider` to work.

## `Auth0AuthProvider` Parameters

-   `loginRedirectUri` - _optional_ - URI used to override the redirect URI after successful login. Defaults to react-admin `/auth-callback` route.
-   `logoutRedirectUri` - _optional_ - URI used to override the redirect URI after successful logout. Defaults to the current url.
-   `redirectOnCheckAuth` - _optional_ - If set to `true` (the default), redirect users to the Auth0 login page inside the [`checkAuth`](https://marmelab.com/react-admin/AuthProviderWriting.html#checkauth) method. Set it to `false` if you want users to go through a [custom login page](https://marmelab.com/react-admin/Authentication.html#customizing-the-login-component) first.

## Passing The Auth0 Token To Your Backend

If you want to pass the Auth0 authentication token to your backend, you can use the [`httpClient`](https://marmelab.com/react-admin/DataProviders.html#adding-custom-headers) exported by this package. For instance, here's how to use it with the [`ra-data-json-server` dataProvider](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-json-server):

```js
import jsonServerProvider from 'ra-data-json-server';
import { httpClient } from 'ra-auth-auth0';
import { auth0 } from './auth0';

const dataProvider = jsonServerProvider(
    'http://localhost:3000',
    httpClient(auth0)
);
```

## Handling Permissions

In order to get the users roles directly from Auth0, you have to configure it so that it includes them in the authentication token. This is done by [adding an Action to the login flow](https://auth0.com/docs/manage-users/access-control/sample-use-cases-actions-with-authorization#add-user-roles-to-tokens).

The `authProvider` exported by this package will look for a claim that has a name with the term `role` in it and return its value. To change this behavior, override the `getPermissions` method:

```js
import { Auth0AuthProvider } from 'ra-auth-auth0';
import { Auth0Client } from './auth0';

const authProvider = {
    ...Auth0AuthProvider(Auth0Client),
    async getPermissions() {
        if (!(await client.isAuthenticated())) {
            return;
        }

        const claims = await client.getIdTokenClaims();
        return claims['https://my-app.example.com/roles'];
    },
};
```

## Demo

You can find a working demo, along with the source code, in this project's repository: https://github.com/marmelab/ra-auth-auth0

## License

This auth provider is licensed under the MIT License and sponsored by [Marmelab](https://marmelab.com).
