import {
  createContext,
  type Context,
  type Oauth2ServerURL,
  type Parameters,
} from './create-context.js'
import { getAccessToken } from './get-access-token.js'
import { getAuthorizationCode } from './get-authorization-code.js'
import { getAuthorizationURL } from './get-authorization-url.js'

class LazyOauth2AuthorizationCodePKCEClient extends HTMLAnchorElement {
  private declare context: Context

  static get observedAttributes() {
    return ['server:endpoint', 'server:authorization_endpoint', 'server:token_endpoint']
  }

  constructor() {
    super()

    this.observer.observe(this, { attributes: true })

    if (!this.hasAttribute('target')) {
      this.setAttribute('target', '_blank')
    }

    if (!this.hasAttribute('rel')) {
      this.setAttribute('rel', 'noopener')
    }

    this.addEventListener('click', async () => {
      if (!this.context) return

      this.setAttribute('disabled', '')

      const response = await getAuthorizationCode(this.context)
      const credentials = await getAccessToken(this.context, response)

      await this.createContext()

      this.dispatchEvent(
        new CustomEvent('oauth2:credentials', {
          detail: credentials,
          bubbles: true,
        })
      )

      this.removeAttribute('disabled')
    })
  }

  private getParameters(): Parameters {
    const attributes = this.getAttributeNames().filter((attribute) =>
      attribute.startsWith('oauth2:')
    )

    const parameters: Record<string, string> = {}

    for (const attribute of attributes) {
      parameters[attribute.substring(7)] = this.getAttribute(attribute)!
    }

    return parameters as object as Parameters
  }

  private observer: MutationObserver = new MutationObserver((mutations) => {
    const parameterHasChanged = mutations.some(
      (mutation) => mutation.type === 'attributes' && mutation.attributeName?.startsWith('oauth2:')
    )

    if (parameterHasChanged && this.context) {
      const { client_id, redirect_uri, scope, ...parameters } = this.getParameters()
      const { response_type, code_challenge, code_challenge_method, state } =
        this.context.authorizationRequest

      this.context.authorizationRequest = {
        response_type,
        code_challenge,
        code_challenge_method,
        client_id,
        redirect_uri,
        scope,
        state,
        ...parameters,
      }
      this.context.accessTokenRequest.redirect_uri = redirect_uri
      this.context.accessTokenRequest.client_id = client_id

      this.setAttribute('href', getAuthorizationURL(this.context).href)
    }
  })

  private async createContext() {
    let server: Oauth2ServerURL

    if (this.hasAttribute('server:endpoint')) {
      server = this.getAttribute('server:endpoint')!
    } else {
      server = {
        authorization_endpoint: this.getAttribute('server:authorization_endpoint')!,
        token_endpoint: this.getAttribute('server:token_endpoint')!,
      }
    }

    this.context = await createContext(server, this.getParameters())
    this.setAttribute('href', getAuthorizationURL(this.context).href)
  }

  async attributeChangedCallback(name: string) {
    if (
      name === 'server:endpoint' ||
      (name === 'server:authorization_endpoint' && this.hasAttribute('server:token_endpoint')) ||
      (name === 'server:token_endpoint' && this.hasAttribute('server:authorization_endpoint'))
    ) {
      await this.createContext()
    }
  }
}

customElements.define(
  'lazy-oauth2-authorization-code-pkce-client',
  LazyOauth2AuthorizationCodePKCEClient,
  {
    extends: 'a',
  }
)
