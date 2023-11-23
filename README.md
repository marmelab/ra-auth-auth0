# ra-auth-auth0

An auth provider for [react-admin](https://github.com/marmelab/react-admin) which handles authentication via a [Auth0](https://auth0.com) instance.

[![Documentation]][DocumentationLink] 
[![Source Code]][SourceCodeLink] 

[Documentation]: https://img.shields.io/badge/Documentation-green?style=for-the-badge
[Source Code]: https://img.shields.io/badge/Source_Code-blue?style=for-the-badge

[DocumentationLink]: ./packages/ra-auth-auth0/Readme.md 'Documentation'
[SourceCodeLink]: https://github.com/marmelab/ra-auth-auth0/tree/main/src/packages/ra-auth-auth0 'Source Code'

This repository contains:

-   The actual `ra-auth-auth0` package
-   A simple demo app you can run locally to try out `ra-auth-auth0` with your own Auth0 instance

## Simple Demo

### Prerequesites

-   You need to have a [Auth0](https://auth0.com) account

### Initial setup

1. Clone this project

We need to add some minimal configuration to our Auth0 instance to use it. This need to be done from the Auth0 Admin Console.

1. Go to the [Auth0 Dashboard](https://manage.auth0.com/dashboard)
1. Select your Auth0 Application (or create a new one)
1. Add `admin@acme.com` user to your Auth0 Application. For this, you need to go to the `User Management` section and create a new user.
1. Add `admin` to the `Roles` section of your Auth0 Application. Assign `admin@acme.com` to the `admin` role.
1. Do the same for `user@acme.com` and the `user` role.
1. Go to the `Applications` section of your Auth0 Application and select `Settings`
1. Create a `single page` application with the following settings:
    - Allowed Callback URLs: `http://127.0.0.1:8081/auth-callback`
    - Allowed Logout URLs: `http://127.0.0.1:8081`
    - Allowed Web Origins: `http://127.0.0.1:8081`
    - Allowed Origins (CORS): `http://127.0.0.1:8081`

If you want to use permissions, you need to add the following to your Auth0 Application as an [`Action`](https://auth0.com/docs/manage-users/access-control/sample-use-cases-actions-with-authorization#add-user-roles-to-tokens):

```JS
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://my-app.example.com';
  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
}
```

The `authProvider` exported by this package will look for a claim that has a name with the term `role` in it and return its value.

For react-admin, you need to setup environment variables. You can do this by creating a `.env` file in the root of the project. The following variables are required:

```JS
VITE_AUTH0_DOMAIN="your-domain.auth0.com"
VITE_AUTH0_CLIENT_ID="your-client-id"
VITE_AUTH0_AUDIENCE="https://your-domain.auth0.com/api/v2/" // optional but recommended for having non opaque tokens
VITE_LOGIN_REDIRECT_URL="http://127.0.0.1:8081/auth-callback"
VITE_LOGOUT_REDIRECT_URL="http://127.0.0.1:8081"
```

1. Run `make install start` to install the dependencies and start the Demo App

### Using the Simple Demo

Now that all is configured and running, you can browse to http://127.0.0.1:8081/ to access the React Admin App.

-   Signing in with `user@acme.com` will only grant the `user` role permissions
-   Signing in with `admin@acme.com` will grant full `admin` role permissions, allowing for instance to see the 'Users' resource in the main menu

Feel free to play around with this demo, along with the Auth0 config, to understand better how it works!

### JSON Server API

The demo app uses a [JSON Server](https://github.com/typicode/json-server) to provide a REST API. You can find the configuration in the `demo-fake-api` folder.
It shows how use middleware to validate the JWT token via the Auth0 API.

## License

This repository and the code it contains are licensed under the MIT License and sponsored by [marmelab](https://marmelab.com).
