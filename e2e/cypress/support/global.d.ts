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

    saveState(key: string, value: string, flag?: boolean): Chainable<any>

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

    // generateKeystore() : Chainable<any>

    generateKeystore() : void

    setHeaders(headerValues : any) : void

    setRequestBody(requestBody : any) : void

    setAuthorizationToken (token : string) : void

    makeAPIRequest(endPoint: string,methodType: string): Chainable<Cypress.Response<any>>

    getUserSession(): Chainable<Cypress.Response<any>>

    compareJSONObjects(actualResponse: any, expectedResponse:any, indexFlag?: boolean) : Chainable<Cypress.Response<any>>

    getUserSessionTokenValue(): Chainable<Cypress.Response<any>>

    getTokenUsingJWKCredentials(credential: any, privateKey: any):Chainable<Cypress.Response<any>>
  }
}
