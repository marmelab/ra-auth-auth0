# Changelog

## 3.0.0

- Publish modern ESM and CommonJS package exports ([#21](https://github.com/marmelab/ra-auth-auth0/pull/21))
- Target ES2020 instead of ES5
- Remove `react` and `react-dom` from peer dependencies ([#20](https://github.com/marmelab/ra-auth-auth0/pull/20))

### Breaking Changes

`ra-auth-auth0` now publishes its ES modules and CommonJS builds in `dist/`, behind an [`exports`](https://nodejs.org/api/packages.html#package-entry-points) map. Only the package root can be imported, so these undocumented paths no longer resolve:

- the old build folders: `ra-auth-auth0/lib/*` and `ra-auth-auth0/esm/*`
- the sources: `ra-auth-auth0/src/*`, even though they are still published
- the manifest: `ra-auth-auth0/package.json`

The published builds now target ES2020 instead of ES5. If you need to support older browsers, transpile `ra-auth-auth0` in your bundler.

## 2.0.1

- Fix invalid state error when using `React.StrictMode` (#17)

## 2.0.0

-   Upgrade `react-admin` to v5
-   Remove prop-types
-   Change imports from `ra-core` to `react-admin`
- [Doc] Fix missing import and enhance `httpClient` data provider section

## 1.1.1

-   Fix logout should wait for client logout to complete before redirecting (#12)
-   Fix `httpClient` should not throw if user is disconnected (#11)
-   Update the doc and jsdoc to mention that `<BrowserRouter>` is required (#7)

## 1.1.0

-   Avoid infinite redirect loop on failures (#6)
-   Ensure all imports are made from `ra-core` instead of `react-admin`
-   Update `ra-core` peer dependency to `4.10.0`
-   Fix `checkAuth` should reject when `redirectOnCheckAuth` is set to `false` (#5)

## 1.0.0

-   Initial release
