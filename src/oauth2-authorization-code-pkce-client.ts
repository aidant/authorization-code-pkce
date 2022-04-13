const channel = new BroadcastChannel('@lazy/oauth2-authorization-code-pkce-client')

interface AuthorizationRequest {
  response_type: 'code'
  code_challenge: string
  code_challenge_method?: 'plain' | 'S256'
  client_id: string
  redirect_uri?: string
  scope?: string
  state?: string
}

interface AuthorizationResponse {
  code: string
  state?: string
}

interface AuthorizationRequestErrorResponse {
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

interface AccessTokenRequest {
  grant_type: 'authorization_code'
  code: string
  code_verifier: string
  redirect_uri?: string
  client_id?: string
}

interface AccessTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
  refresh_token?: string
  scope?: string
}

interface AccessTokenErrorResponse {
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

export interface Parameters {
  [parameter: string]: string | undefined
}

const base64URLEncode = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

export const createCodeVerifier = (): string =>
  base64URLEncode(crypto.getRandomValues(new Uint8Array(32)))

export const createCodeChallenge = async (codeVerifier: string): Promise<string> =>
  base64URLEncode(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier)))

export type ErrorCodes =
  | 'window-create-failed'
  | 'no-response'
  | 'error-response'
  | 'state-mismatch'

export class AuthorizationCodeError extends Error {
  declare code: ErrorCodes
  declare response: AuthorizationResponse | AuthorizationRequestErrorResponse | null

  constructor(
    code: ErrorCodes,
    response: AuthorizationResponse | AuthorizationRequestErrorResponse | null = null
  ) {
    super(code)
    this.code = code
    this.response = response
  }
}

export interface GetAccessTokenOptions {
  authorizeURL: string
  tokenURL: string
  codeVerifier?: string
}

export const getAccessToken = async (
  { authorizeURL, tokenURL, codeVerifier }: GetAccessTokenOptions,
  { ...parameters }: Parameters = {}
): Promise<AccessTokenResponse> => {
  const url = new URL(authorizeURL)

  if (!codeVerifier) codeVerifier = createCodeVerifier()
  if (!parameters.response_type) parameters.response_type = 'code'
  if (!parameters.code_challenge)
    parameters.code_challenge =
      parameters.code_challenge_method === 'plain'
        ? codeVerifier
        : await createCodeChallenge(codeVerifier)
  if (!parameters.code_challenge_method) parameters.code_challenge_method = 'S256'
  if (!parameters.state)
    parameters.state = crypto
      .getRandomValues(new Uint8Array(48))
      .reduce((string, number) => string + number.toString(16).padStart(2, '0'), '')

  for (const parameter in parameters) {
    if (parameters[parameter]) {
      url.searchParams.set(parameter, parameters[parameter]!)
    }
  }

  const child = open(url, '_blank')
  if (!child) throw new AuthorizationCodeError('window-create-failed')

  const response = await new Promise<
    AuthorizationResponse | AuthorizationRequestErrorResponse | null
  >((resolve) => {
    const handleMessage = (event: MessageEvent) => {
      channel.removeEventListener('message', handleMessage)
      child.close()

      resolve(event.data)
    }

    channel.addEventListener('message', handleMessage)
  })

  if (!response) throw new AuthorizationCodeError('no-response')
  if ('error' in response) throw new AuthorizationCodeError('error-response', response)
  if (response.state !== parameters.state)
    throw new AuthorizationCodeError('state-mismatch', response)

  const accessTokenRequest: AccessTokenRequest = {
    grant_type: 'authorization_code',
    code: response.code,
    code_verifier: codeVerifier,
  }

  if (url.searchParams.has('redirect_uri'))
    accessTokenRequest.redirect_uri = url.searchParams.get('redirect_uri')
  if (url.searchParams.has('client_id'))
    accessTokenRequest.client_id = url.searchParams.get('client_id')

  const accessTokenResponse = await fetch(tokenURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(Object.entries(accessTokenRequest)).toString(),
  })

  if (!accessTokenResponse.ok) {
    throw new AuthorizationCodeError('error-response', await accessTokenResponse.json())
  }

  return accessTokenResponse.json()
}

export const handleAuthorizationCodeCallback = () => {
  const query = new URLSearchParams(location.search)

  let response = null

  if (query.has('error') || query.has('access_token')) {
    response = Object.fromEntries(query.entries())
  }

  channel.postMessage(response)
}
