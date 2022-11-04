import { type AccessTokenRequest } from './get-access-token.js'
import { type AuthorizationRequest } from './get-authorization-code.js'

export interface AuthorizationServerMetadata {
  authorization_endpoint: string
  token_endpoint: string
}

export type Oauth2ServerURL = string | AuthorizationServerMetadata

export interface Parameters {
  client_id: string
  redirect_uri?: string
  scope?: string
}

export interface Context {
  metadata: AuthorizationServerMetadata
  authorizationRequest: AuthorizationRequest
  accessTokenRequest: AccessTokenRequest
}

const asciiBase64URLEncode = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

const createCryptographicString = (): string =>
  asciiBase64URLEncode(crypto.getRandomValues(new Uint8Array(32)))

const createCodeChallenge = async (codeVerifier: string): Promise<string> =>
  asciiBase64URLEncode(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
  )

const getAuthorizationServerMetadata = async (
  server: Oauth2ServerURL
): Promise<AuthorizationServerMetadata> => {
  if (typeof server === 'object') {
    return server
  } else if (
    server.includes('/.well-known/oauth-authorization-server') ||
    server.includes('/.well-known/openid-configuration')
  ) {
    const response = await fetch(server)
    const metadata = await response.json()
    if (metadata.authorization_endpoint && metadata.token_endpoint) {
      return metadata
    } else {
      throw new Error('Invalid OAuth 2.0 Authorization Server Metadata')
    }
  } else {
    return {
      authorization_endpoint: server.replace(/\/?$/, '/authorize'),
      token_endpoint: server.replace(/\/?$/, '/token'),
    }
  }
}

export const createContext = async <T extends Parameters>(
  server: Oauth2ServerURL,
  { client_id, redirect_uri, scope, ...parameters }: T
): Promise<Context> => {
  const state = createCryptographicString()
  const code_verifier = createCryptographicString()

  const [metadata, code_challenge] = await Promise.all([
    getAuthorizationServerMetadata(server),
    createCodeChallenge(code_verifier),
  ])

  return {
    metadata,
    authorizationRequest: {
      response_type: 'code',
      code_challenge,
      code_challenge_method: 'S256',
      client_id,
      redirect_uri,
      scope,
      state,
      ...parameters,
    },
    accessTokenRequest: {
      grant_type: 'authorization_code',
      code: '',
      code_verifier,
      redirect_uri,
      client_id,
    },
  }
}
