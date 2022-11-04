# Lazy OAuth 2.0 Authorization Code PKCE Client

<p align='center'>
  A simple OAuth 2.0 Authorization Code PKCE client for the lazy developer.
  <br>
  <a href='https://www.npmjs.com/package/@lazy/oauth2-authorization-code-pkce-client'>
    <img src="https://img.shields.io/npm/v/@lazy/oauth2-authorization-code-pkce-client?style=flat-square">
  </a>
  <a href='https://bundlephobia.com/package/@lazy/oauth2-authorization-code-pkce-client'>
    <img src="https://img.shields.io/bundlephobia/minzip/@lazy/oauth2-authorization-code-pkce-client?label=minified%20%26%20gzipped&style=flat-square">
  </a>
  <a href='https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/actions/workflows/publish.yml'>
    <img src="https://img.shields.io/github/workflow/status/aidant/lazy-oauth2-authorization-code-pkce-client/Publish?style=flat-square">
  </a>
</p>

---

## Table of Contents

- [Example](#example)
  - [HTML](#html)
  - [JavaScript](#javascript)
- [API](#api)
  - [`lazy-oauth2-authorization-code-pkce-client`]
  - [`handleAuthorizationCodeFlow`]
  - [`handleAuthorizationCodeCallback`]
  - [`createContext`]
  - [`getAuthorizationURL`]
  - [`getAuthorizationCode`]
  - [`getAccessToken`]
- [Submodules](#submodules)

## Example

### HTML

All functionality of this package is exposed through a web component that is
accessible by default, the web component is the recommended way to use this package.

````html
```html
<head>
  <script
    type="module"
    src="https://cdn.skypack.dev/@lazy/oauth2-authorization-code-pkce-client/register-callback.js"
  ></script>
  <script
    type="module"
    src="https://cdn.skypack.dev/@lazy/oauth2-authorization-code-pkce-client/register-web-component.js"
  ></script>
  <script type="module">
    addEventListener('oauth2:credentials', (event) => {
      console.log(event.detail)
    })
  </script>
</head>

<body>
  <a
    is="lazy-oauth2-authorization-code-pkce-client"
    server:authorization_endpoint="https://auth.example.com/oauth2/authorize"
    server:token_endpoint="https://auth.example.com/oauth2/token"
    oauth2:client_id="d66de78a-50e2-4007-ba6b-55f86ee40b61"
    oauth2:scope="email"
  >
    Connect with Example
  </a>
</body>
````

### JavaScript

If you need a lower-level JavaScript API you can use [`handleAuthorizationCodeFlow`] or
[`createContext`], [`getAuthorizationURL`], [`getAuthorizationCode`], and [`getAccessToken`].

```ts
import {
  handleAuthorizationCodeFlow,
  handleAuthorizationCodeCallback,
} from '@lazy/oauth2-authorization-code-pkce-client'

handleAuthorizationCodeCallback()

const button = document.createElement('button')
button.textContent = 'Login'

button.addEventListener('click', () => {
  const response = await handleAuthorizationCodeFlow('https://auth.example.com/oauth2', {
    client_id: 'd66de78a-50e2-4007-ba6b-55f86ee40b61',
    scope: 'email',
  })
  const token = `${response.token_type} ${response.access_token}`
  console.log(token)
})
```

## API

### [`lazy-oauth2-authorization-code-pkce-client`]

The custom web component `<a is="lazy-oauth2-authorization-code-pkce-client">`
is the simplest solution to adding the OAuth 2.0 Authorization Code PKCE flow.
The `@lazy/oauth2-authorization-code-pkce-client/register-callback.js` script
should be loaded on the callback page.

#### Parameters

- `server:endpoint` - _string_ - The base URL or metadata URL of the OAuth 2.0 provider.
- `server:authorization_endpoint` - _string_ - The URL of the OAuth 2.0 provider's authorization endpoint.
- `server:token_endpoint` - _string_ - The URL of the OAuth 2.0 provider's token endpoint.
- `oauth2:*` - _string_ - The OAuth 2.0 parameters such as; `client_id`, `scope`, and/or `redirect_uri`.

```html
<head>
  <script
    type="module"
    src="https://cdn.skypack.dev/@lazy/oauth2-authorization-code-pkce-client/register-web-component.js"
  ></script>
</head>

<body>
  <a
    is="lazy-oauth2-authorization-code-pkce-client"
    server:authorization_endpoint="https://auth.example.com/oauth2/authorize"
    server:token_endpoint="https://auth.example.com/oauth2/token"
    oauth2:client_id="d66de78a-50e2-4007-ba6b-55f86ee40b61"
    oauth2:scope="email"
  >
    Connect with Example
  </a>
</body>
```

Emits the `oauth2:credentials` CustomEvent with the OAuth 2.0 credentials.

### `handleAuthorizationCodeFlow`

The [`handleAuthorizationCodeFlow`] function handles the Authorization Code
authentication flow. A new window is created where the user is then prompted to
authenticate with the OAuth 2.0 provider, once the user had accepted or rejected
the request the `handleAuthorizationCodeCallback` function then handles the response
and returns it back via the promise from `handleAuthorizationCodeFlow` - just like
magic.

#### Parameters

- `oauth2server` - **string** or **object** - The base URL, metadata URL, or metadata of the OAuth 2.0 provider.
- `parameters` - _object_ - The OAuth 2.0 parameters such as; `client_id`, `scope`, and/or `redirect_uri`.

#### Example

```ts
import { handleAuthorizationCodeFlow } from '@lazy/oauth2-authorization-code-pkce-client/handle-authorization-code-flow.js'

const button = document.createElement('button')
button.textContent = 'Login'

button.addEventListener('click', () => {
  const response = await handleAuthorizationCodeFlow('https://auth.example.com/oauth2', {
    client_id: 'example-client-id',
  })
  const token = `${response.token_type} ${response.access_token}`
  console.log(token)
})
```

Returns `Promise<AccessTokenSuccessResponse>`

### `handleAuthorizationCodeCallback`

The [`handleAuthorizationCodeCallback`] function is responsible for returning
the response from the authentication endpoint back to the
[`handleAuthorizationCodeFlow`] function. If you call the
[`handleAuthorizationCodeFlow`] and [`handleAuthorizationCodeCallback`]
functions in the same page make sure you call the
[`handleAuthorizationCodeCallback`] function before the
[`handleAuthorizationCodeFlow`].

#### Example

```ts
import { handleAuthorizationCodeCallback } from '@lazy/oauth2-authorization-code-pkce-client/handle-authorization-code-callback.js'

handleAuthorizationCodeCallback()
```

Returns `void`

### `createContext`

The [`createContext`] function allows you to create a context object that is
used by the lower level functions. Each context should only be used once, if you
need you can call [`createContext`] multiple times to get several context objects.

#### Parameters

- `oauth2server` - **string** or **object** - The base URL, metadata URL, or metadata of the OAuth 2.0 provider.
- `parameters` - _object_ - The OAuth 2.0 parameters such as; `client_id`, `scope`, and/or `redirect_uri`.

#### Example

```ts
import { createContext } from '@lazy/oauth2-authorization-code-pkce-client/create-context.js'

const context = await createContext('https://auth.example.com/oauth2', {
  client_id: 'example-client-id',
})
```

Returns `Promise<Context>`

### `getAuthorizationURL`

Create the URL to the OAuth 2.0 provider's authorization endpoint.

#### Parameters

- `context` - **Context** - The context object returned from [`createContext`].

#### Example

```ts
import { getAuthorizationURL } from '@lazy/oauth2-authorization-code-pkce-client/get-authorization-url.js'

const url = getAuthorizationURL(context)
open(url, '_blank', 'noopener')
```

### `getAuthorizationCode`

#### Parameters

Get the authorization code from the callback endpoint.

- `context` - **Context** - The context object returned from [`createContext`].

#### Example

```ts
import { getAuthorizationCode } from '@lazy/oauth2-authorization-code-pkce-client/get-authorization-code.js'

const response = await getAuthorizationCode(context)
```

Returns `Promise<AuthorizationSuccessResponse>`

### `getAccessToken`

Exchange an authorization code for an access token.

#### Parameters

- `context` - **Context** - The context object returned from [`createContext`].
- `response` - **AuthorizationSuccessResponse** - The Authorization Code response.

#### Example

```ts
import { getAccessToken } from '@lazy/oauth2-authorization-code-pkce-client/get-access-token.js'

const credentials = await getAccessToken(context, response)
```

Returns `Promise<AccessTokenSuccessResponse>`

## Submodules

There are two main submodules for this package; `@lazy/oauth2-authorization-code-pkce-client/register-web-component.js` and `@lazy/oauth2-authorization-code-pkce-client/register-callback.js` these can be used to setup the OAuth 2.0 flow without writing any JavaScript. Each function also has a submodule associated with it to optimize bundle size, a list of all the submodules can be found below:

- `@lazy/oauth2-authorization-code-pkce-client/authorization-code-error.js`
- `@lazy/oauth2-authorization-code-pkce-client/create-context.js`
- `@lazy/oauth2-authorization-code-pkce-client/get-access-token.js`
- `@lazy/oauth2-authorization-code-pkce-client/get-authorization-code.js`
- `@lazy/oauth2-authorization-code-pkce-client/get-authorization-url.js`
- `@lazy/oauth2-authorization-code-pkce-client/handle-authorization-code-callback.js`
- `@lazy/oauth2-authorization-code-pkce-client/handle-authorization-code-flow.js`
- `@lazy/oauth2-authorization-code-pkce-client/register-callback.js`
- `@lazy/oauth2-authorization-code-pkce-client/register-web-component.js`

[`lazy-oauth2-authorization-code-pkce-client`]: #lazy-oauth2-authorization-code-pkce-client
[`handleauthorizationcodeflow`]: #handleauthorizationcodeflow
[`handleauthorizationcodecallback`]: #handleauthorizationcodecallback
[`createcontext`]: #createcontext
[`getauthorizationurl`]: #getauthorizationurl
[`getauthorizationcode`]: #getauthorizationcode
[`getaccesstoken`]: #getaccesstoken
