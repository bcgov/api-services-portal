/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

declare namespace Cypress {
  interface Chainable<Subject> {
    login(username: string, password: string): void

    getSession(): Chainable<Cypress.Response<any>>

    loginByAuthAPI(username: string, password: string): Chainable<Cypress.Response<any>>

    logout(): void

    preserveCookies(): void

    saveState(key: string, value: string): void

    getState(key: string): string

    clearState(): void
  }
}
