# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 1.0.0-rc.4 - 2022-11-05

### Fixed

  - The `get-authorization-url.js` submodule was incorrectly called `create-authorization-url.js`

## 1.0.0-rc.3 - 2022-11-04

### Added

  - `AuthorizationServerMetadata`
  - `Oauth2ServerURL`
  - [`getAuthorizationURL`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/bd110e01863bfd8de9648e987d5a6f37c2aed6cf#getauthorizationurl)
  - [`lazy-oauth2-authorization-code-pkce-client`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/bd110e01863bfd8de9648e987d5a6f37c2aed6cf#lazy-oauth2-authorization-code-pkce-client)

### Changed

  - Renamed `AuthorizationCodeContext` to `Context` and changed its representation to encapsulate the entire exchange.
  - Renamed `getAuthorizationCodeContext` to [`createContext`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/bd110e01863bfd8de9648e987d5a6f37c2aed6cf#createcontext)
  - Changed `getAccessToken` parameters to be `Context` and `AuthorizationSuccessResponse`
  - Renamed [`getAuthorizationCodeResponse`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/1e19768283dd3b2d5f794e33b90c5464c05f073e#getauthorizationcoderesponse) to [`getAuthorizationCode`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/bd110e01863bfd8de9648e987d5a6f37c2aed6cf#getauthorizationcode)


## 1.0.0-rc.2 - 2022-10-30

### Added

  - `AccessTokenErrorResponse`
  - `AccessTokenRequest`
  - `AccessTokenResponse`
  - `AccessTokenSuccessResponse`
  - `AuthorizationCodeContext`
  - `AuthorizationRequest`
  - `AuthorizationRequestErrorResponse`
  - `AuthorizationResponse`
  - `AuthorizationSuccessResponse`
  - [`getAuthorizationCodeContext`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/1e19768283dd3b2d5f794e33b90c5464c05f073e#getauthorizationcodecontext)
  - [`getAuthorizationCodeResponse`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/1e19768283dd3b2d5f794e33b90c5464c05f073e#getauthorizationcoderesponse)
  - [`handleAuthorizationCodeFlow`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/1e19768283dd3b2d5f794e33b90c5464c05f073e#handleauthorizationcodeflow)

### Changed
  - [`getAccessToken`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/1e19768283dd3b2d5f794e33b90c5464c05f073e#getaccesstoken) has been functionally replaced with [`handleAuthorizationCodeFlow`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/1e19768283dd3b2d5f794e33b90c5464c05f073e#handleauthorizationcodeflow), which is implemented with three lower-level functions: [`getAuthorizationCodeContext`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/1e19768283dd3b2d5f794e33b90c5464c05f073e#getauthorizationcodecontext), [`getAuthorizationCodeResponse`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/1e19768283dd3b2d5f794e33b90c5464c05f073e#getauthorizationcoderesponse), and [`getAccessToken`](https://github.com/aidant/lazy-oauth2-authorization-code-pkce-client/tree/1e19768283dd3b2d5f794e33b90c5464c05f073e#getaccesstoken).

### Removed

  - `createCodeChallenge`
  - `createCodeVerifier`
  - `GetAccessTokenOptions`

## 1.0.0-rc.1 - 2022-04-17

### Added

  - `AuthorizationCodeError`
  - `createCodeChallenge`
  - `createCodeVerifier`
  - `ErrorCodes`
  - `getAccessToken`
  - `GetAccessTokenOptions`
  - `handleAuthorizationCodeCallback`
  - `Parameters`
