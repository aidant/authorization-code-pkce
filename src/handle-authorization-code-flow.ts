import { AuthorizationCodeError } from './authorization-code-error.js'
import { createContext, type Oauth2ServerURL, type Parameters } from './create-context.js'
import { getAccessToken, type AccessTokenSuccessResponse } from './get-access-token.js'
import { getAuthorizationCode } from './get-authorization-code.js'
import { getAuthorizationURL } from './get-authorization-url.js'

export const handleAuthorizationCodeFlow = async <
  T extends Parameters,
  R extends AccessTokenSuccessResponse
>(
  server: Oauth2ServerURL,
  parameters: T
): Promise<R> => {
  const context = await createContext(server, parameters)
  const url = getAuthorizationURL(context)
  if (!open(url, '_blank', 'noopener')) throw new AuthorizationCodeError('window-create-failed')
  const response = await getAuthorizationCode(context)
  return getAccessToken<R>(context, response)
}
