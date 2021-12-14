/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

declare namespace Cypress {
  interface Chainable<Subject> {
    login(username: string, password: string): Chainable<any>

    getSession(): Chainable<Cypress.Response<any>>

    loginByAuthAPI(username: string, password: string): Chainable<Cypress.Response<any>>

    logout(): void

    deleteAllCookies(): void

    preserveCookies(): void

    makeKongRequest(serviceName : string, methodType : string): Chainable<any>

    preserveCookiesDefaults(): void

    saveState(key: string, value: string): void

    getState(key: string): Chainable<Cypress.Response<any>>

    resetState(): void

    getAccessToken(
      client_id: string,
      client_secret: string
    ): Chainable<Cypress.Response<any>>

    publishApi(content: any): Chainable<Cypress.Response<any>>
  }
}
