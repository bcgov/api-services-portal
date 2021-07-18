/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    login(username: string, password: string): Chainable<Element>

    getSession(): Chainable<any>

    callApi(options: Partial<RequestOptions>): Chainable<Subject>

    addContext(message: any): Chainable<Subject>

    loginByAuthAPI(username: string, password: string): Chainable<Subject>

    logout(): Chainable<Subject>
  }
}
