import { AuthorizationCodeError } from './authorization-code-error.js'
import { type Context } from './create-context.js'

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

export const getAuthorizationCode = async (
  context: Context
): Promise<AuthorizationSuccessResponse> => {
  const channel = new BroadcastChannel('@lazy/oauth2-authorization-code-pkce-client')

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
  if (response.state !== context.authorizationRequest.state)
    throw new AuthorizationCodeError('state-mismatch', response)
  if ('error' in response)
    throw new AuthorizationCodeError('authorization-code-error-response', response)

  return response
}
