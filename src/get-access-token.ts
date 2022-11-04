import { AuthorizationCodeError } from './authorization-code-error.js'
import { type Context } from './create-context.js'
import { type AuthorizationSuccessResponse } from './get-authorization-code.js'

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

export const getAccessToken = async <T extends AccessTokenSuccessResponse>(
  context: Context,
  response: AuthorizationSuccessResponse
): Promise<T> => {
  const accessTokenResponse = await fetch(context.metadata.token_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(
      Object.entries(Object.assign(context.accessTokenRequest, { code: response.code })).filter(
        ([, value]) => value
      )
    ),
  })

  if (!accessTokenResponse.ok) {
    throw new AuthorizationCodeError(
      'access-token-error-response',
      await accessTokenResponse.json()
    )
  }

  return accessTokenResponse.json()
}
