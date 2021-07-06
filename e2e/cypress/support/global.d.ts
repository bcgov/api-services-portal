/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    loginToDev(username: string, password: string): Chainable<Element>

    verifySession(url: string): Chainable<Element>

    callApi(options: Partial<RequestOptions>): Chainable<Response<any>>
  }
}
