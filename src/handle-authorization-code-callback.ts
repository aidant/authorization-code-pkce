import {
  type AccessTokenErrorResponse,
  type AccessTokenResponse,
  type AccessTokenSuccessResponse,
} from './get-access-token.js'

export const handleAuthorizationCodeCallback = (): void => {
  const channel = new BroadcastChannel('@lazy/oauth2-authorization-code-pkce-client')

  const query = new URLSearchParams(location.search)
  let response: AccessTokenResponse = null

  if (query.has('error') || query.has('code')) {
    response = Object.fromEntries(query.entries()) as object as
      | AccessTokenSuccessResponse
      | AccessTokenErrorResponse
  }

  channel.postMessage(response)
  channel.addEventListener(
    'message',
    (event) => {
      if (event.data === 'response-received') window.close()
    },
    { once: true }
  )
}
