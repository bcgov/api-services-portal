import * as jwt from 'jsonwebtoken'
import HomePage from '../pageObjects/home'
import LoginPage from '../pageObjects/login'
import NamespaceAccessPage from '../pageObjects/namespaceAccess'
import _ = require('cypress/types/lodash')
import { checkElementExists } from './e2e'
// import _ = require('cypress/types/lodash')
const njwt = require('njwt')

const fs = require('fs')

const config = require('../fixtures/manage-control/kong-plugin-config.json')

const jose = require('node-jose')

const YAML = require('yamljs')

const forge = require('node-forge')

let headers: any

const login = new LoginPage()

let requestBody: any = {}
interface formDataRequestOptions {
  method: string
  url: string
}

Cypress.Commands.add('login', (username: string, password: string, skipFlag = false) => {
  cy.log('< Log in with user ' + username)
  const home = new HomePage()

  cy.get('header').then(($a) => {
    if ($a.text().includes('Login')) {
      cy.selectLoginOptions(username)
      const log = Cypress.log({
        name: 'Login to Dev',
        displayName: 'LOGIN_DEV',
        message: [`🔐 Authenticating | ${username}`],
        autoEnd: false,
      })
      cy.get('body').then(($body) => {
        if (!($body.find(login.usernameInput).length > 0)) {
          cy.get('[data-testid=auth-menu-user]').click({ force: true })
          cy.contains('Logout').click()
          cy.selectLoginOptions(username)
        }
      })
      cy.get(login.usernameInput).click().type(username)
      cy.get(login.passwordInput).click().type(password)
      cy.get(login.loginSubmitButton).click()
    }
  })

  if (checkElementExists('.alert')) {
    cy.reload()
    cy.get(login.usernameInput).click().type(username)
    cy.get(login.passwordInput).click().type(password)
    cy.get(login.loginSubmitButton).click()
  }

  if (!skipFlag) {
    cy.get(home.gatewaysNavButtom, { timeout: 6000 }).then(($el) => {
      expect($el).to.exist
      expect($el).to.be.visible
    })
    cy.log('> Log in')
  }
})

Cypress.Commands.add('keycloakLogin', (username: string, password: string) => {
  cy.log('< Log in with user ' + username)
  const login = new LoginPage()
  const home = new HomePage()
  cy.get(login.usernameInput).click().type(username)
  cy.get(login.passwordInput).click().type(password)
  cy.get(login.loginSubmitButton).click()
})

Cypress.Commands.add('createGateway', (gatewayid?: string, displayname?: string) => {
  cy.log('< Create namespace - ')
  const payload = {
    gatewayId: gatewayid ? gatewayid : '',
    displayName: displayname ? displayname : '',
  }
  cy.setHeaders({ 'Content-Type': 'application/json' })
  cy.setRequestBody(payload)
  return cy.callAPI('ds/api/v3/gateways', 'POST').then(
    ({ apiRes: { body, status } }: any) => {
      cy.log(JSON.stringify(body, null, 2))
      expect(status).to.be.equal(200)
      if (payload.gatewayId) {
        expect(body.gatewayId).to.be.equal(payload.gatewayId)
      }
      if (payload.displayName) {
        expect(body.displayName).to.be.equal(payload.displayName)
      }
      return cy.wrap(body)
    }
  )
})

Cypress.Commands.add('activateGateway', (gatewayId: string) => {
  const getAllNsQuery = `
query GetNamespaces {
  allNamespaces {
    id
    name
  }
}
`
  const currentNsQuery = `
  query GetCurrentNamespace {
    currentNamespace {
      name
      org
      orgUnit
    }
  }
`
  cy.log('< Activating namespace - ' + gatewayId)
  // get the (true) id for the namespace
  cy.setHeaders({ 'Content-Type': 'application/json' })
  return cy.gqlQuery(getAllNsQuery).then((response) => {
    const nsdata = response.apiRes.body.data.allNamespaces.find((ns: { name: string }) => ns.name === gatewayId)
    if (nsdata) {
      return nsdata.id
    } else {
      throw new Error('Namespace not found')
    }
  }).then((namespaceId) => {
    // then activate the namespace
    cy.setHeaders({ 'Content-Type': 'application/json' })
    cy.callAPI(`admin/switch/${namespaceId}`, 'PUT')
    return cy.gqlQuery(currentNsQuery).then((response) => {
      const currentNs = response.apiRes.body.data.currentNamespace
      expect(currentNs.name).to.eq(gatewayId)
    })
  })
})

Cypress.Commands.add('getLastConsumerID', () => {
  let id: any
  cy.get('[data-testid="all-consumer-control-tbl"]')
    .find('tr')
    .last()
    .find('td')
    .first()
    .find('a')
    .then(($text) => {
      id = $text.text()
      return id
    })
})

Cypress.Commands.add('resetCredential', (accessRole: string) => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  cy.visit('/')
  cy.reload()
  cy.fixture('apiowner').as('apiowner')
  cy.fixture('common-testdata').as('common-testdata')
  cy.preserveCookies()
  cy.visit(login.path)
  cy.get('@apiowner').then(({ user }: any) => {
    cy.get('@common-testdata').then(({ checkPermission }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      cy.activateGateway(checkPermission.namespace)
      cy.visit(na.path)
      na.revokeAllPermission(checkPermission.grantPermission[accessRole].userName)
      cy.wait(2000)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission[accessRole])
    })
  })
})

Cypress.Commands.add(
  'getUserSessionTokenValue',
  (namespace: string, isNamespaceSelected?: boolean) => {
    const login = new LoginPage()
    const home = new HomePage()
    const na = new NamespaceAccessPage()
    let userSession: string
    cy.visit('/')
    cy.reload()
    cy.fixture('apiowner').as('apiowner')
    cy.preserveCookies()
    cy.visit(login.path)
    cy.getUserSession().then(() => {
      cy.get('@apiowner').then(({ user }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        // cy.activateGateway(apiTest.namespace)
        if (isNamespaceSelected || undefined) {
          cy.activateGateway(namespace)
        }
        cy.get('@login').then(function (xhr: any) {
          userSession = xhr.response.headers['x-auth-request-access-token']
          return userSession
        })
      })
    })
  }
)

Cypress.Commands.add('getUserSessionResponse', () => {
  cy.getUserSession().then(() => {
    cy.get('@login').then(function (xhr: any) {
      return xhr
    })
  })
})

Cypress.Commands.add('getSession', () => {
  cy.log('< Get Session')
  cy.request({ method: 'GET', url: Cypress.config('baseUrl') + '/admin/session' }).then(
    (res) => {
      cy.wrap(res).as('session')
      expect(res.status).to.eq(200)
      const log = Cypress.log({
        name: 'Session Info',
        displayName: 'SESSION_INFO',
        message: JSON.stringify(res.body),
      })
    }
  )
  cy.log('> Get Session')
})

Cypress.Commands.add('loginByAuthAPI', (username: string, password: string): any => {
  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  })
  log.snapshot('before')
  return cy
    .request({
      method: 'POST',
      url: Cypress.env('OIDC_ISSUER') + '/protocol/openid-connect/token',
      body: {
        grant_type: 'password',
        username: Cypress.env('DEV_USERNAME'),
        password: Cypress.env('DEV_PASSWORD'),
        Scope: 'openid',
        client_id: Cypress.env('CLIENT_ID'),
        client_secret: Cypress.env('CLIENT_SECRET'),
      },
      form: true,
    })
    .then(({ body }: any) => {
      const user: any = jwt.decode(body.id_token)
      const userItem = {
        token: body.access_token,
        user: {
          ...user,
        },
      }
      log.snapshot('after')
      log.end()
      return userItem
    })
})

Cypress.Commands.add('logout', () => {
  cy.log('< Logging out')
  cy.getSession().then(() => {
    cy.get('@session').then((res: any) => {
      cy.visit('/')
      cy.wait(3000)
      cy.get('[data-testid=auth-menu-user]').click({ force: true })
      cy.get('[data-testid=auth-menu-signout-btn]').click({ force: true })
    })
  })
  cy.log('> Logging out')
})

Cypress.Commands.add('keycloakLogout', () => {
  cy.log('< Logging out')
  cy.get('.dropdown-toggle.ng-binding').click()
  cy.contains('Sign Out').click()
  cy.log('> Logging out')
})

Cypress.Commands.add('getAccessToken', (client_id: string, client_secret: string) => {
  cy.log('< Get Token')
  cy.request({
    method: 'POST',
    url: Cypress.env('TOKEN_URL'),
    body: {
      grant_type: 'client_credentials',
      scope: 'openid',
      client_id,
      client_secret,
    },
    form: true,
    failOnStatusCode: false,
  }).then((res) => {
    cy.wrap(res).as('accessTokenResponse')
    // expect(res.status).to.eq(200)
  })
  cy.log('> Get Token')
})

Cypress.Commands.add('getServiceOrRouteID', (configType: string, host: string) => {
  const config = configType.toLowerCase()
  cy.request({
    method: 'GET',
    url: Cypress.env('KONG_CONFIG_URL') + '/' + config,
  }).then((res) => {
    expect(res.status).to.eq(200)
    if (config === 'routes') {
      cy.saveState(
        config + 'ID',
        Cypress._.get(
          Cypress._.filter(res.body.data, ['hosts', [host + '.api.gov.bc.ca']])[0],
          'id'
        )
      )
    } else {
      cy.saveState(
        config + 'ID',
        Cypress._.get(Cypress._.filter(res.body.data, ['name', host])[0], 'id')
      )
    }
  })
})

Cypress.Commands.add(
  'publishApi',
  (fileNames: any, namespace: string, flag?: boolean) => {
    let fixtureFile = flag ? 'state/regen' : 'state/store'
    cy.log('< Publish API')
    let fileName = ''
    if (fileNames instanceof Array) {
      for (const filepath of fileNames) {
        fileName = fileName + ' ./cypress/fixtures/' + filepath
      }
    } else {
      fileName = ' ./cypress/fixtures/' + fileNames
    }
    const requestName: string = 'publishAPI'
    cy.fixture(fixtureFile).then((creds: any) => {
      const serviceAcctCreds = JSON.parse(creds.credentials)
      cy.getAccessToken(serviceAcctCreds.clientId, serviceAcctCreds.clientSecret).then(
        () => {
          cy.wait(3000)
          cy.get('@accessTokenResponse').then((res: any) => {
            cy.executeCliCommand('gwa config set --gateway ' + namespace).then(
              (response) => {
                cy.executeCliCommand(
                  'gwa config set --token ' + res.body.access_token
                ).then((response) => {
                  {
                    expect(response.stdout).to.contain('Config settings saved')
                    cy.executeCliCommand('gwa pg ' + fileName).then((response) => {
                      expect(response.stdout).to.contain('Gateway config published')
                    })
                  }
                })
              }
            )
          })
        }
      )
    })
  }
)

Cypress.Commands.add('deleteAllCookies', () => {
  cy.clearCookies()
  cy.clearAllLocalStorage()
  cy.clearAllSessionStorage()
  cy.clearCookie('keystone.sid')
  cy.clearCookie('_oauth2_proxy')
  cy.exec('npm cache clear --force')
  var cookies = document.cookie.split(';')
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i]
    var eqPos = cookie.indexOf('=')
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
})

Cypress.Commands.add(
  'makeKongRequest',
  (serviceName: string, methodType: string, key?: string) => {
    let authorization
    cy.fixture('state/regen').then((creds: any) => {
      cy.wait(5000)
      let token = key
      if (key == undefined) {
        token = creds.apikey
      }
      const service = serviceName
      cy.log('Token->' + token)
      return cy.request({
        url: Cypress.env('KONG_URL'),
        method: methodType,
        headers: { 'x-api-key': `${token}`, Host: `${service}` + '.api.gov.bc.ca' },
        failOnStatusCode: false,
        auth: {
          bearer: token,
        },
      })
    })
  }
)

Cypress.Commands.add(
  'makeKongGatewayRequest',
  (endpoint: string, requestName: string, methodType: string) => {
    let body = {}
    var serviceEndPoint = endpoint
    body = config[requestName]
    if (requestName == '') {
      body = {}
    }
    return cy.request({
      url: Cypress.env('KONG_CONFIG_URL') + '/' + serviceEndPoint,
      method: methodType,
      body: body,
      form: true,
      failOnStatusCode: false,
    })
  }
)

Cypress.Commands.add(
  'makeKongGatewayRequestUsingClientIDSecret',
  (hostURL: string, methodType = 'GET') => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      let cc = JSON.parse(store_res.clientidsecret)

      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((token_res: any) => {
          let token = token_res.body.access_token
          cy.request({
            method: methodType,
            url: Cypress.env('KONG_URL'),
            failOnStatusCode: false,
            headers: {
              Host: hostURL,
            },
            auth: {
              bearer: token,
            },
          })
        })
      })
    })
  }
)

Cypress.Commands.add(
  'updateKongPlugin',
  (pluginName: string, name: string, endPoint?: string, verb = 'POST') => {
    cy.fixture('state/store').then((creds: any) => {
      let body = {}
      const pluginID = pluginName.toLowerCase() + 'id'
      const id = creds[pluginID]
      let endpoint
      if (pluginName == '') endpoint = 'plugins'
      else if (id !== undefined)
        endpoint = pluginName.toLowerCase() + '/' + id.toString() + '/' + 'plugins'
      endpoint = typeof endPoint !== 'undefined' ? endPoint : endpoint
      body = config[name]
      cy.log('Body->' + body)
      return cy.request({
        url: Cypress.env('KONG_CONFIG_URL') + '/' + endpoint,
        method: verb,
        body: body,
        form: true,
        failOnStatusCode: false,
      })
    })
  }
)

Cypress.Commands.add(
  'updateKongPluginForJSONRequest',
  (jsonBody: string, endPoint: string, verb = 'POST') => {
    cy.fixture('state/store').then((creds: any) => {
      let body = {}
      let headers = { 'content-type': 'application/json', accept: 'application/json' }
      body = jsonBody
      return cy.request({
        url: Cypress.env('KONG_CONFIG_URL') + '/' + endPoint,
        method: verb,
        body: body,
        headers: headers,
        failOnStatusCode: false,
      })
    })
  }
)

Cypress.Commands.add('generateKeystore', async () => {
  let keyStore = jose.JWK.createKeyStore()
  await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' })
  return JSON.stringify(keyStore.toJSON(true), null, '  ')
})

Cypress.Commands.add('setHeaders', (headerValues: any) => {
  headers = headerValues
})

Cypress.Commands.add('setRequestBody', (body: any) => {
  requestBody = JSON.stringify(body)
})

Cypress.Commands.add('setAuthorizationToken', (token: string) => {
  headers['Authorization'] = 'Bearer ' + token
})

Cypress.Commands.add('callAPI', (endPoint: string, methodType: string) => {
  let body = '{}'
  let requestData: any = {}
  if (methodType.toUpperCase() === 'PUT' || methodType.toUpperCase() === 'POST') {
    body = requestBody
  }

  requestData['appname'] = 'Test1'
  requestData['url'] = Cypress.env('BASE_URL') + '/' + endPoint
  requestData['headers'] = headers
  requestData['body'] = ''
  requestData['method'] = methodType

  cy.request({
    url: Cypress.env('BASE_URL') + '/' + endPoint,
    method: methodType,
    body,
    headers,
    failOnStatusCode: false,
  }).then((apiResponse) => {
    // You can also return data or use it in further tests
    const responseData = {
      apiRes: apiResponse,
    }
    // cy.addToAstraScanIdList(response2.body.status)
    return responseData
  })
})

Cypress.Commands.add('makeAPIRequest', (endPoint: string, methodType: string) => {
  let body = {}
  let requestData: any = {}
  if (methodType.toUpperCase() === 'PUT' || methodType.toUpperCase() === 'POST') {
    body = requestBody
  }

  requestData['appname'] = 'Test1'
  requestData['url'] = Cypress.env('BASE_URL') + '/' + endPoint
  requestData['headers'] = headers
  requestData['body'] = ''
  requestData['method'] = methodType

  // Scan request with Astra
  if (Cypress.env('ASTRA_SCAN_ENABLED') == 'true') {
    cy.request({
      url: 'http://astra.localtest.me:8094/scan/',
      method: 'POST',
      body: requestData,
      headers: headers,
      failOnStatusCode: false,
    }).then((astraResponse) => {
      // Actual API request
      cy.request({
        url: Cypress.env('BASE_URL') + '/' + endPoint,
        method: methodType,
        body: body,
        headers: headers,
        failOnStatusCode: false,
      }).then((apiResponse) => {
        // You can also return data or use it in further tests
        const responseData = {
          astraRes: astraResponse,
          apiRes: apiResponse,
        }
        // cy.addToAstraScanIdList(response2.body.status)
        return responseData
      })
    })
  } else {
    cy.request({
      url: Cypress.env('BASE_URL') + '/' + endPoint,
      method: methodType,
      body: body,
      headers: headers,
      failOnStatusCode: false,
    }).then((apiResponse) => {
      const responseData = {
        apiRes: apiResponse,
      }
      return responseData
    })
  }
})

Cypress.Commands.add('gqlQuery', (query, variables = {}) => {
  cy.loginByAuthAPI('', '').then((token_res: any) => {
    cy.setHeaders({ 
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
    cy.setAuthorizationToken(token_res.token)
    return cy.request({
      url: Cypress.env('BASE_URL') + '/gql/api',
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      failOnStatusCode: false,
    }).then((apiResponse) => {
      // You can also return data or use it in further tests
      const responseData = {
        apiRes: apiResponse,
      }
      // cy.addToAstraScanIdList(response2.body.status)
      return responseData
    })
  })
})

Cypress.Commands.add('makeAPIRequestForScanResult', (scanID: string) => {
  return cy.request({
    url: 'http://astra.localtest.me:8094/alerts/' + scanID,
    method: 'GET',
    failOnStatusCode: false,
  })
})

Cypress.Commands.add('getUserSession', () => {
  cy.intercept(Cypress.config('baseUrl') + '/admin/session').as('login')
})

Cypress.Commands.add('selectLoginOptions', (username: string) => {
  cy.get(login.loginDropDown).click()
  if (username.includes('idir')) {
    login.selectAPIProviderLoginOption()
  } else {
    login.selectDeveloperLoginOption()
  }
})

Cypress.Commands.add('verifyToastMessage', (msg: string) => {
  cy.get('[role="alert"]', { timeout: 2000 })
    .closest('div')
    .invoke('text')
    .then((text) => {
      const toastText = text
      expect(toastText).to.contain(msg)
    })
})

Cypress.Commands.add(
  'compareJSONObjects',
  (actualResponse: any, expectedResponse: any, indexFlag = false) => {
    let response = actualResponse
    if (indexFlag) {
      const index = actualResponse.findIndex(
        (x: { name: string }) => x.name === expectedResponse.name
      )
      response = actualResponse[index]
    }
    for (var p in expectedResponse) {
      if (typeof expectedResponse[p] === 'object') {
        var objectValue1 = expectedResponse[p],
          objectValue2 = response[p]
        for (var value in objectValue1) {
          if (!['activityAt', 'id'].includes(value)) {
            cy.compareJSONObjects(objectValue2[value], objectValue1[value])
          }
        }
      } else {
        if (expectedResponse[p] == 'true' || expectedResponse[p] == 'false')
          Boolean(expectedResponse[p])
        if (['organization', 'organizationUnit'].includes(p) && !indexFlag) {
          response[p] = response[p]['name']
        }
        if (
          response[p] !== expectedResponse[p] &&
          !['clientSecret', 'appId', 'isInCatalog', 'isDraft', 'consumer', 'id'].includes(
            p
          )
        ) {
          cy.log('Different Value ->' + expectedResponse[p])
          assert.fail('JSON value mismatch for ' + p)
        }
      }
    }
  }
)

Cypress.Commands.add(
  'updatePluginFile',
  (filename: string, serviceName: string, pluginFileName: string) => {
    cy.readFile('cypress/fixtures/' + pluginFileName).then(($el) => {
      let newObj: any
      newObj = YAML.parse($el)
      cy.readFile('cypress/fixtures/' + filename).then((content: any) => {
        let obj = YAML.parse(content)
        const keys = Object.keys(obj)
        Object.keys(obj.services).forEach(function (key, index) {
          if (obj.services[index].name == serviceName) {
            obj.services[index].plugins = newObj.plugins
          }
        })
        const yamlString = YAML.stringify(obj, 'utf8')
        cy.writeFile('cypress/fixtures/' + filename, yamlString)
      })
    })
  }
)

Cypress.Commands.add(
  'updatePropertiesOfPluginFile',
  (filename: string, propertyName: any, propertyValue: any) => {
    cy.readFile('cypress/fixtures/' + filename).then((content: any) => {
      let obj = YAML.parse(content)
      const keys = Object.keys(obj)
      if (propertyName === 'config.anonymous') {
        obj.plugins[0].config.anonymous = propertyValue
      } else if (propertyName === 'tags') {
        obj.plugins[0][propertyName] = propertyValue
      } else {
        Object.keys(obj.services).forEach(function (key, index) {
          if (propertyName == 'methods') {
            obj.services[0].routes[0].methods = propertyValue
          } else {
            obj.services[0].plugins[0].config[propertyName] = propertyValue
          }
        })
      }
      const yamlString = YAML.stringify(obj, 'utf8')
      cy.writeFile('cypress/fixtures/' + filename, yamlString)
    })
  }
)

Cypress.Commands.add(
  'getTokenUsingJWKCredentials',
  (credential: any, privateKey: any) => {
    let jwkCred = JSON.parse(credential)
    let clientId = jwkCred.clientId
    let tokenEndpoint = jwkCred.tokenEndpoint

    let now = Math.floor(new Date().getTime() / 1000)
    let plus5Minutes = new Date((now + 5 * 60) * 1000)
    let alg = 'RS256'

    let claims = {
      aud: Cypress.env('OIDC_ISSUER'),
    }

    let jwt = njwt
      .create(claims, privateKey, alg)
      .setIssuedAt(now)
      .setExpiration(plus5Minutes)
      .setIssuer(clientId)
      .setSubject(clientId)
      .compact()

    cy.request({
      url: tokenEndpoint,
      method: 'POST',
      body: {
        grant_type: 'client_credentials',
        client_id: clientId,
        scopes: 'openid',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt,
      },
      form: true,
    })
  }
)

Cypress.Commands.add('generateKeyPair', () => {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 })

  // Convert the key pair to PEM format
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey)
  const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey)

  cy.writeFile('cypress/fixtures/state/jwtReGenPrivateKey_new.pem', privateKeyPem)
  cy.writeFile('cypress/fixtures/state/jwtReGenPublicKey_new.pub', publicKeyPem)
})

Cypress.Commands.add('forceVisit', (url: string) => {
  cy.window().then((win) => {
    return win.open(url, '_self')
  })
})

Cypress.Commands.add(
  'updateJsonBoby',
  (json: any, key: string, newValue: string): any => {
    json[key] = newValue
    return json
  }
)

const formDataRequest = (
  options: formDataRequestOptions,
  accessToken: string,
  fileName: string,
  requestName: string
) => {
  const data = new FormData()
  data.append('hasHeader', 'true')
  cy.intercept(options.method, options.url)
    .as(requestName)
    .window()
    .then((win) => {
      cy.fixture(fileName, 'binary')
        .then((bin) => Cypress.Blob.binaryStringToBlob(bin))
        .then((blob) => {
          const xhr = new win.XMLHttpRequest()
          data.set('configFile', blob, fileName)
          data.set('dryRun', 'false')
          xhr.open(options.method, options.url)
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
          xhr.send(data)
        })
    })
}
