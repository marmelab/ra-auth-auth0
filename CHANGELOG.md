# Changelog

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
