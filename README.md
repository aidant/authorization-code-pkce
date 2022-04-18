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
- [API](#api)
  - [`handleAuthorizationCodeFlow`]
  - [`handleAuthorizationCodeCallback`]
  - [`getAuthorizationCodeContext`]
  - [`getAuthorizationCodeResponse`]
  - [`getAccessToken`]

## Example

```ts
import { handleAuthorizationCodeCallback } from '@lazy/oauth2-authorization-code-pkce-client'

handleAuthorizationCodeCallback()

const button = document.createElement('button')
button.textContent = 'Login'

button.addEventListener('click', () => {
  const response = await handleAuthorizationCodeFlow('https://api.example.com', {
    client_id: 'example-client-id',
  })
  const token = `${response.token_type} ${response.access_token}`
  console.log(token)
})
```

## API

### `handleAuthorizationCodeFlow`

The [`handleAuthorizationCodeFlow`] function handles the Authorization Code
authentication flow. A new window is created where the user is then prompted to
authenticate with the OAuth 2.0 provider, once the user had accepted or rejected
the request the `handleAuthorizationCodeCallback` function then handles the response
and returns it back via the promise from `handleAuthorizationCodeFlow` - just like
magic.

#### Parameters

- `oauth2server` - **string** - The URL of the OAuth 2.0 provider.
- `parameters` - _object_ - The OAuth 2.0 parameters such as; `client_id`, `scope`, and/or `redirect_uri`.

#### Example

```ts
import { handleAuthorizationCodeFlow } from '@lazy/oauth2-authorization-code-pkce-client'

const button = document.createElement('button')
button.textContent = 'Login'

button.addEventListener('click', () => {
  const response = await handleAuthorizationCodeFlow('https://api.example.com', {
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
import { handleAuthorizationCodeCallback } from '@lazy/oauth2-authorization-code-pkce-client'

handleAuthorizationCodeCallback()
```

Returns `void`

### `getAuthorizationCodeContext`

The [`getAuthorizationCodeContext`] function allows you to create a context
object that can be used in the dom on anchor tags or the like to improve
accessability over buttons with click handlers.

This context should only be used once, if you need you can call
[`getAuthorizationCodeContext`] multiple times to get several context objects.

#### Parameters

- `authorizeEndpoint` - **string** - The Authorize endpoint of the OAuth 2.0 provider.
- `parameters` - _object_ - The OAuth 2.0 parameters such as; `client_id`, `scope`, and/or `redirect_uri`.

#### Example

```ts
import { getAuthorizationCodeContext } from '@lazy/oauth2-authorization-code-pkce-client'

const context = await getAuthorizationCodeContext('https://api.example.com/authorize', {
  client_id: 'example-client-id',
})

const a = document.createElement('a')
a.href = context.url.href
a.target = '_blank'
a.rel = 'noopener'
a.textContent = 'Login'

a.addEventListener(
  'click',
  () => {
    a.remove()
  },
  { once: true }
)

document.append(a)
```

Returns `Promise<AuthorizationCodeContext>`

### `getAuthorizationCodeResponse`

#### Parameters

- `context` - **AuthorizationCodeContext** - The context object for the OAuth 2.0 Flow.

#### Example

```ts
import { getAuthorizationCodeResponse } from '@lazy/oauth2-authorization-code-pkce-client'

const response = await getAuthorizationCodeResponse(context)
```

Returns `Promise<AuthorizationSuccessResponse>`

### `getAccessToken`

#### Parameters

- `tokenEndpoint` - **string** - The Token endpoint of the OAuth 2.0 provider.
- `context` - **AuthorizationCodeContext** - The context object for the OAuth 2.0 Flow.
- `response` - _AuthorizationSuccessResponse_ - The Authorization Code response.

#### Example

```ts
import { getAccessToken } from '@lazy/oauth2-authorization-code-pkce-client'

const context = await getAuthorizationCodeContext('https://api.example.com/authorize', {
  client_id: 'example-client-id',
})

const a = document.createElement('a')
a.href = context.url.href
a.target = '_blank'
a.rel = 'noopener'
a.textContent = 'Login'

a.addEventListener(
  'click',
  async () => {
    a.remove()
    const response = await getAccessToken('https://api.example.com/token', context)
    const token = `${response.token_type} ${response.access_token}`
    console.log(token)
  },
  { once: true }
)

document.append(a)
```

Returns `Promise<ImplicitGrantSuccessResponse>`

[`handleauthorizationcodeflow`]: #handleauthorizationcodeflow
[`handleauthorizationcodecallback`]: #handleauthorizationcodecallback
[`getauthorizationcodecontext`]: #getauthorizationcodecontext
[`getauthorizationcoderesponse`]: #getauthorizationcoderesponse
[`getaccesstoken`]: #getaccesstoken
