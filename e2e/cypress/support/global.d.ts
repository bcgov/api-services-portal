/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    login(username: string, password: string): Chainable<Element>

    getSession(url: string): Chainable<Subject>

    callApi(options: Partial<RequestOptions>): Chainable<Subject>

    addContext(message: any): Chainable<Subject>

    loginByAuthAPI(username: string, password: string): Chainable<Subject>
  }
}
