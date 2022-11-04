import { type Context } from './create-context.js'

export const getAuthorizationURL = (context: Context): URL => {
  const url = new URL(context.metadata.authorization_endpoint)

  for (const [key, value] of Object.entries(context.authorizationRequest))
    if (value) url.searchParams.set(key, value)

  return url
}
