/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

declare namespace Cypress {
  interface Chainable<Subject> {
    login(username: string, password: string, skipFlag?: boolean): Chainable<any>

    resetCredential(accessRole: string): Chainable<any>

    getSession(): Chainable<Cypress.Response<any>>

    loginByAuthAPI(username: string, password: string): Chainable<Cypress.Response<any>>

    logout(): void

    keycloakLogout(): void

    deleteAllCookies(): void

    preserveCookies(): void

    makeKongRequest(serviceName: string, methodType: string, key?: string): Chainable<any>

    makeKongGatewayRequestUsingClientIDSecret(hostURL: string, methodType?: string): Chainable<any>

    preserveCookiesDefaults(): void

    saveState(key: string, value: string, flag?: boolean, isGlobal?: boolean): Chainable<any>

    getState(key: string): Chainable<any>

    resetState(): void

    getAccessToken(
      client_id: string,
      client_secret: string
    ): Chainable<Cypress.Response<any>>

    publishApi(fileNames: any, namespace: string, flag?: boolean): Chainable<Cypress.Response<any>>

    getServiceOrRouteID(configType: string, host: string
    ): Chainable<Cypress.Response<any>>

    updateKongPlugin(pluginName: string, name: string, endPoint?: string, verb?: string): Chainable<Cypress.Response<any>>

    makeKongGatewayRequest(endpoint: string, requestName: string, methodType: string): Chainable<Cypress.Response<any>>

    // generateKeystore() : Chainable<any>

    generateKeystore(): void

    setHeaders(headerValues: any): void

    setRequestBody(requestBody: any): void

    setAuthorizationToken(token: string): void

    makeAPIRequest(endPoint: string, methodType: string): Chainable<Cypress.Response<any>>

    getUserSession(): Chainable<Cypress.Response<any>>

    compareJSONObjects(actualResponse: any, expectedResponse: any, indexFlag?: boolean): Chainable<Cypress.Response<any>>

    getUserSessionTokenValue(namespace: string, isNamespaceSelected?: boolean): Chainable<Cypress.Response<any>>

    getUserSessionResponse(): Chainable<Cypress.Response<any>>

    getTokenUsingJWKCredentials(credential: any, privateKey: any): Chainable<Cypress.Response<any>>

    verifyToastMessage(msg: string): Chainable<Cypress.Response<any>>

    updatePluginFile(filename: string, serviceName: string, pluginFileName: string): Chainable<Cypress.Response<any>>

    updateElementsInPluginFile(filename: string, elementName: string, elementValue: string): Chainable<Cypress.Response<any>>

    updatePropertiesOfPluginFile(filename: string, propertyName: any, propertyValue: any): Chainable<Cypress.Response<any>>

    keycloakLogin(username: string, password: string): Chainable<any>

    selectLoginOptions(username: string): Chainable<any>

    getLastConsumerID(): Chainable<any>

    generateKeyPair(): void
    // isProductDisplay(productName: string, expResult : boolean) :Chainable<Cypress.Response<any>>

    updateJsonValue(filePath: string, jsonPath: string, newValue: string, index?: any): Chainable<any>

    updateKongPluginForJSONRequest(jsonBody: string, endPoint: string, verb?: string): Chainable<Cypress.Response<any>>

    forceVisit(url: string): Chainable<any>

    executeCliCommand(command: string): Chainable<any>

    replaceWordInJsonObject(targetWord: string, replacement: string, fileName: string): Chainable<Cypress.Response<any>>

    gwaPublish(type: string, fileName: string): Chainable<Cypress.Response<any>>

    replaceWord(originalString: string, wordToReplace: string, replacementWord: string): Chainable<any>

    updateJsonBoby(json: any, key: string, newValue: string):Chainable<any>

    deleteFileInE2EFolder(fileName: string):Chainable<any>

    addToAstraScanIdList(item: any):Chainable<any>
    
    checkAstraScanResultForVulnerability():Chainable<any>

    makeAPIRequestForScanResult(scanID: string): Chainable<Cypress.Response<any>>
  }
}
