/*
  OAuth 2.0 Authorization Code PKCE Types
*/

export interface AuthorizationRequest {
  response_type: 'code'
  code_challenge: string
  code_challenge_method?: 'plain' | 'S256'
  client_id: string
  redirect_uri?: string
  scope?: string
  state?: string
}

export interface AuthorizationSuccessResponse {
  code: string
  state?: string
}

export interface AuthorizationRequestErrorResponse {
  error:
    | 'invalid_request'
    | 'unauthorized_client'
    | 'access_denied'
    | 'unsupported_response_type'
    | 'invalid_scope'
    | 'server_error'
    | 'temporarily_unavailable'
    | string
  error_description?: string
  error_uri?: string
  state?: string
}

export type AuthorizationResponse =
  | AuthorizationSuccessResponse
  | AuthorizationRequestErrorResponse
  | null

export interface AccessTokenRequest {
  grant_type: 'authorization_code'
  code: string
  code_verifier: string
  redirect_uri?: string
  client_id?: string
}

export interface AccessTokenSuccessResponse {
  access_token: string
  token_type: string
  expires_in?: number
  refresh_token?: string
  scope?: string
}

export interface AccessTokenErrorResponse {
  error:
    | 'invalid_request'
    | 'invalid_client'
    | 'invalid_grant'
    | 'unauthorized_client'
    | 'unsupported_grant_type'
    | 'invalid_scope'
    | string
  error_description?: string
  error_uri?: string
}

export type AccessTokenResponse = AccessTokenSuccessResponse | AccessTokenErrorResponse | null

/*
  Lazy OAuth 2.0 Authorization Code PKCE Client Types
*/

export interface Parameters extends Partial<AuthorizationRequest> {
  [parameter: string]: string | undefined
}

export type ErrorCodes =
  | 'window-create-failed'
  | 'no-response'
  | 'authorization-code-error-response'
  | 'access-token-error-response'
  | 'state-mismatch'

export class AuthorizationCodeError extends Error {
  constructor(
    public readonly code: ErrorCodes,
    public readonly response: AuthorizationResponse | AccessTokenResponse = null
  ) {
    super(code)
  }
}

export interface AuthorizationCodeContext {
  codeVerifier: string
  url: URL
}

/*
  Utilities
*/

const channel = new BroadcastChannel('@lazy/oauth2-authorization-code-pkce-client')

const asciiBase64URLEncode = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

const createCodeVerifier = (): string =>
  asciiBase64URLEncode(crypto.getRandomValues(new Uint8Array(32)))

const createCodeChallenge = async (codeVerifier: string): Promise<string> =>
  asciiBase64URLEncode(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
  )

const createState = (): string =>
  crypto
    .getRandomValues(new Uint8Array(48))
    .reduce((string, number) => string + number.toString(16).padStart(2, '0'), '')

/*
  Lazy OAuth 2.0 Authorization Code PKCE Client
*/

export const createAuthorizationCodeContext = async (
  authorizeEndpoint: string,
  { ...parameters }: Parameters = {},
  { codeVerifier = createCodeVerifier() } = {}
): Promise<AuthorizationCodeContext> => {
  const url = new URL(authorizeEndpoint)

  if (!parameters.response_type) parameters.response_type = 'code'
  if (!parameters.code_challenge)
    parameters.code_challenge =
      parameters.code_challenge_method === 'plain'
        ? codeVerifier
        : await createCodeChallenge(codeVerifier)
  if (!parameters.code_challenge_method) parameters.code_challenge_method = 'S256'
  if (!parameters.state) parameters.state = createState()

  for (const parameter in parameters) {
    if (parameters[parameter]) {
      url.searchParams.set(parameter, parameters[parameter]!)
    }
  }

  return { codeVerifier, url }
}

export const getAuthorizationCodeResponse = async (
  context: AuthorizationCodeContext
): Promise<AuthorizationSuccessResponse> => {
  const response = await new Promise<AuthorizationResponse>((resolve) => {
    channel.addEventListener(
      'message',
      (event: MessageEvent) => {
        channel.postMessage('response-received')
        resolve(event.data)
      },
      { once: true }
    )
  })

  if (!response) throw new AuthorizationCodeError('no-response')
  if (response.state !== context.url.searchParams.get('state'))
    throw new AuthorizationCodeError('state-mismatch', response)
  if ('error' in response)
    throw new AuthorizationCodeError('authorization-code-error-response', response)

  return response
}

export const getAccessToken = async (
  tokenEndpoint: string,
  context: AuthorizationCodeContext,
  response?: AuthorizationSuccessResponse
): Promise<AccessTokenSuccessResponse> => {
  if (!response) response = await getAuthorizationCodeResponse(context)

  const accessTokenRequest: AccessTokenRequest = {
    grant_type: 'authorization_code',
    code: response.code,
    code_verifier: context.codeVerifier,
  }

  if (context.url.searchParams.has('redirect_uri'))
    accessTokenRequest.redirect_uri = context.url.searchParams.get('redirect_uri')!
  if (context.url.searchParams.has('client_id'))
    accessTokenRequest.client_id = context.url.searchParams.get('client_id')!

  const accessTokenResponse = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(Object.entries(accessTokenRequest)),
  })

  if (!accessTokenResponse.ok) {
    throw new AuthorizationCodeError(
      'access-token-error-response',
      await accessTokenResponse.json()
    )
  }

  return accessTokenResponse.json()
}

export const handleAuthorizationCodeFlow = async (
  oauth2Server: string,
  parameters: Parameters = {}
): Promise<AccessTokenSuccessResponse> => {
  const context = await createAuthorizationCodeContext(oauth2Server + '/authorize', parameters)
  if (!open(context.url, '_blank')) throw new AuthorizationCodeError('window-create-failed')
  return getAccessToken(oauth2Server + '/token', context)
}

export const handleAuthorizationCodeCallback = () => {
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
