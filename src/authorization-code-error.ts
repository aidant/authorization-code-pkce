import { type AccessTokenResponse } from './get-access-token.js'
import { type AuthorizationResponse } from './get-authorization-code.js'

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
    console.error(response)
  }
}
