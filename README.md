# ra-auth-auth0

An auth provider for [react-admin](https://github.com/marmelab/react-admin) which handles authentication via a [Auth0](https://auth0.com) instance.

This repository contains:

-   The actual `ra-auth-auth0` package
-   A simple demo app you can run locally to try out `ra-auth-auth0` with your own Auth0 instance

## The `ra-auth-auth0` package

-   Please have a look at the [DOCUMENTATION](./packages/ra-auth-auth0/Readme.md)
-   And also why not the [source code](https://github.com/marmelab/ra-auth-auth0/tree/main/src/packages/ra-auth-auth0)

## Simple Demo

### Prerequesites

-   You need to have a [Auth0](https://auth0.com) account

### Initial setup

1. Clone this project

We need to add some minimal configuration to our Auth0 instance to use it. This need to be done from the Auth0 Admin Console.

1. Go to the [Auth0 Dashboard](https://manage.auth0.com/dashboard)
1. Select your Auth0 Application (or create a new one)
1. Add `admin@marmelab.com` user to your Auth0 Application. For this, you need to go to the `User Management` section and create a new user.
1. Add `admin` to the `Roles` section of your Auth0 Application. Assign admin@marmelab.com to the `admin` role.
1. Do the same for `user@marmelab.com` and the `user` role.
1. Go to the `Applications` section of your Auth0 Application and select `Settings`
1. Create a `single page` application with the following settings:
    - Allowed Callback URLs: `http://localhost:8081`
    - Allowed Logout URLs: `http://localhost:8081`
    - Allowed Web Origins: `http://localhost:8081`
    - Allowed Origins (CORS): `http://localhost:8081`

If you want to use permissions, you need to add the following to your Auth0 Application as a `Rule`:

```JS
function (user, context, callback) {
  const namespace = 'ra-auth-auth0.eu.auth0.com';
  const assignedRoles = (context.authorization || {}).roles;

  let idTokenClaims = context.idToken || {};
  let accessTokenClaims = context.accessToken || {};

  idTokenClaims[`${namespace}/roles`] = assignedRoles;
  accessTokenClaims[`${namespace}/roles`] = assignedRoles;

  context.idToken = idTokenClaims;
  context.accessToken = accessTokenClaims;

  callback(null, user, context);
}
```

For you react-admin, you need to setup environment variables. You can do this by creating a `.env` file in the root of the project. The following variables are required:

```JS
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-audience // optional but recommended for aving non opaque tokens
VITE_LOGIN_REDIRECT_URL = 'http://127.0.0.1:8081'
VITE_LOGOUT_REDIRECT_URL = 'http://127.0.0.1:8081'
VITE_API_URL = 'http://127.0.0.1:3000'
```

1. Run `make install run` to install the dependencies and start the Demo App

### Using the Simple Demo

Now that all is configured and running, you can browse to http://localhost:8081/ to access the React Admin App.

-   Signing in with `user@marmelab.com` will only grant the `user` role permissions
-   Signing in with `admin@marmelab.com` will grant full `admin` role permissions, allowing for instance to see the 'Users' resource in the main menu

Feel free to play around with this demo, along with the Auth0 config, to understand better how it works!

### JSON Server API

The demo app uses a [JSON Server]() to provide a REST API. You can find the configuration in the `demo-fake-api` folder.
It shows how use middleware to validate the JWT token via the Auth0 API.

## License

This repository and the code it contains are licensed under the MIT License and sponsored by [marmelab](https://marmelab.com).
