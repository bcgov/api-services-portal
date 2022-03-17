/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

declare namespace Cypress {
  interface Chainable<Subject> {
    login(username: string, password: string): Chainable<any>

    resetCredential(accessRole: string): Chainable<any>

    getSession(): Chainable<Cypress.Response<any>>

    loginByAuthAPI(username: string, password: string): Chainable<Cypress.Response<any>>

    logout(): void

    deleteAllCookies(): void

    preserveCookies(): void

    makeKongRequest(serviceName : string, methodType : string, key?: string): Chainable<any>

    preserveCookiesDefaults(): void

    saveState(key: string, value: string): Chainable<any>

    getState(key: string): Chainable<any>

    resetState(): void

    getAccessToken(
      client_id: string,
      client_secret: string
    ): Chainable<Cypress.Response<any>>

    publishApi(content: any, namespace: string): Chainable<Cypress.Response<any>>
    
    getServiceOrRouteID(configType: string
    ): Chainable<Cypress.Response<any>>

    updateKongPlugin(pluginName : string, name : string, endPoint?: string, verb?: string): Chainable<Cypress.Response<any>>

    makeKongGatewayRequest(endpoint: string, requestName:string, methodType: string): Chainable<Cypress.Response<any>>

    generateKeystore() : Chainable<any>
  }
}
