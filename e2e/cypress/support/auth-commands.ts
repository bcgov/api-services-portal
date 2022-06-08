import * as jwt from 'jsonwebtoken'
import HomePage from '../pageObjects/home'
import LoginPage from '../pageObjects/login'
import request = require('request')
import { method } from 'cypress/types/bluebird'
import { url } from 'inspector'
import { checkElementExists } from '.'
import NamespaceAccessPage from '../pageObjects/namespaceAccess'
import _ = require('cypress/types/lodash')

const config = require('../fixtures/manage-control/kong-plugin-config.json')

const jose = require('node-jose')

let headers: any

let requestBody: any = {}
interface formDataRequestOptions {
  method: string
  url: string
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.log('< Log in with user ' + username)
  const login = new LoginPage()
  const home = new HomePage()

  cy.get('header').then(($a) => { 
    if ($a.text().includes('Login')) {
      debugger
      cy.get(login.loginButton).click()
      const log = Cypress.log({
        name: 'Login to Dev',
        displayName: 'LOGIN_DEV',
        message: [`🔐 Authenticating | ${username}`],
        autoEnd: false,
      })
      cy.get(login.usernameInput).click().type(username)
      cy.get(login.passwordInput).click().type(password)
      cy.get(login.loginSubmitButton).click()
    }
  })
  debugger
  if (checkElementExists('.alert')) {
    cy.reload()
    cy.get(login.usernameInput).click().type(username)
    cy.get(login.passwordInput).click().type(password)
    cy.get(login.loginSubmitButton).click()
  }

  // log.end()
  // cy.getLoginCallback().then(() => {
  //   cy.get('@login1').should((response :any) => {
  //     debugger
  //     if (response.status == 403)
  //       cy.wait(60000);
  //       cy.log("Trigger the block")
  //   })
  // })
  cy.get(home.nsDropdown, { timeout: 6000 }).then(($el) => {
    expect($el).to.exist
    expect($el).to.be.visible
    expect($el).contain('No Active Namespace')
  })
  cy.log('> Log in')
})

Cypress.Commands.add('resetCredential', (accessRole: string) => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  cy.deleteAllCookies()
  cy.visit('/')
  cy.reload()
  cy.fixture('apiowner').as('apiowner')
  cy.preserveCookies()
  cy.visit(login.path)
  cy.get('@apiowner').then(({ user, checkPermission }: any) => {
    cy.login(user.credentials.username, user.credentials.password)
    cy.log('Logged in!')
    home.useNamespace(checkPermission.namespace)
    cy.visit(na.path)
    na.revokeAllPermission(checkPermission.grantPermission[accessRole].userName)
    na.clickGrantUserAccessButton()
    na.grantPermission(checkPermission.grantPermission[accessRole])
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

Cypress.Commands.add('loginByAuthAPI', (username: string, password: string) => {
  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  })
  log.snapshot('before')
  cy.request({
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
  }).then(({ body }: any) => {
    const user: any = jwt.decode(body.id_token)
    const userItem = {
      token: body.access_token,
      user: {
        ...user,
      },
    }
    cy.log(JSON.stringify(userItem))
  })
  log.snapshot('after')
  log.end()
})

Cypress.Commands.add('logout', () => {

  cy.log('< Logging out')
  cy.getSession().then(() => {
    cy.get('@session').then((res: any) => {
      cy.get('[data-testid=auth-menu-user]').click({ force: true })
      cy.contains('Sign Out').click()
    })
  })
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
  }).then((res) => {
    cy.wrap(res).as('accessTokenResponse')
    expect(res.status).to.eq(200)
  })
  cy.log('> Get Token')
})

Cypress.Commands.add('getServiceOrRouteID', (configType: string) => {
  const config = configType.toLowerCase()
  cy.request({
    method: 'GET',
    url: Cypress.env('KONG_CONFIG_URL') + '/' + config,
  }).then((res) => {
    expect(res.status).to.eq(200)
    cy.saveState(config + 'ID', res.body.data[0].id)
  })
})

Cypress.Commands.add('publishApi', (fileName: string, namespace: string) => {
  cy.log('< Publish API')
  const requestName: string = 'publishAPI'
  cy.fixture('state/store').then((creds: any) => {
    const serviceAcctCreds = JSON.parse(creds.credentials)
    cy.getAccessToken(serviceAcctCreds.clientId, serviceAcctCreds.clientSecret).then(
      () => {
        cy.get('@accessTokenResponse').then((res: any) => {
          const options = {
            method: 'PUT',
            url: Cypress.env('GWA_API_URL') + '/namespaces/' + namespace + '/gateway',
          }
          formDataRequest(options, res.body.access_token, fileName, requestName)
          cy.wait(`@${requestName}`).then((res: any) => {
            cy.wrap(res.response).as('publishAPIResponse')
          })
        })
      }
    )
  })
})

Cypress.Commands.add('deleteAllCookies', () => {
  cy.clearCookies()
  cy.clearCookie('keystone.sid')
  cy.clearCookie('_oauth2_proxy')
  cy.exec('npm cache clear --force')
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
})

Cypress.Commands.add('makeKongRequest', (serviceName: string, methodType: string, key?: string) => {
  cy.fixture('state/store').then((creds: any) => {
    let token = key || creds.apikey
    cy.log("Token->" + token)
    const service = serviceName
    return cy.request({
      url: Cypress.env('KONG_URL'),
      method: methodType,
      headers: { 'x-api-key': `${token}`, 'Host': `${service}` + '.api.gov.bc.ca' },
      failOnStatusCode: false
    })
  })
})

Cypress.Commands.add('makeKongGatewayRequest', (endpoint: string, requestName: string, methodType: string) => {
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
    failOnStatusCode: false
  })
})

Cypress.Commands.add('updateKongPlugin', (pluginName: string, name: string, endPoint?: string, verb = 'POST') => {
  cy.fixture('state/store').then((creds: any) => {
    let body = {}
    const pluginID = pluginName.toLowerCase() + 'id'
    const id = creds[pluginID]
    let endpoint
    if (pluginName == '')
      endpoint = 'plugins'
    else
      endpoint = pluginName.toLowerCase() + '/' + id.toString() + '/' + 'plugins'
    endpoint = (typeof endPoint !== 'undefined') ? endPoint : endpoint
    body = config[name]
    cy.log("Body->" + body)
    return cy.request({
      url: Cypress.env('KONG_CONFIG_URL') + '/' + endpoint,
      method: verb,
      body: body,
      form: true,
      failOnStatusCode: false
    })
  })
})

Cypress.Commands.add("generateKeystore", async () => {
  let keyStore = jose.JWK.createKeyStore()
  await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' })
  return JSON.stringify(keyStore.toJSON(true), null, '  ')
});

Cypress.Commands.add('setHeaders', (headerValues: any) => {
  headers = headerValues
})

Cypress.Commands.add('setRequestBody', (body: any) => {
  debugger
  requestBody = JSON.stringify(body)
})

Cypress.Commands.add('setAuthorizationToken', (token: string) => {
  headers["Authorization"] = "Bearer " + token
  headers = headers
})

Cypress.Commands.add('makeAPIRequest', (endPoint: string, methodType: string) => {
  let body = {}

  if (methodType.toUpperCase() === 'PUT' || methodType.toUpperCase() === 'POST') {
    body = requestBody
  }
  return cy.request({
    url: Cypress.env('BASE_URL') + '/' + endPoint,
    method: methodType,
    body: body,
    headers: headers,
    failOnStatusCode: false
  })
})

Cypress.Commands.add('getUserSession', () => {
  cy.intercept(Cypress.config('baseUrl') + '/admin/session').as('login')
})

Cypress.Commands.add('compareJSONObjects', (actualResponse: any, expectedResponse: any, indexFlag = false) => {
  let response = actualResponse
  if (indexFlag) {
    const index = actualResponse.findIndex((x: { name: string }) => x.name === expectedResponse.name);
    response = actualResponse[index]
  }
  for (var p in expectedResponse) {
    if (typeof (expectedResponse[p]) === "object") {
      var objectValue1 = expectedResponse[p],
        objectValue2 = response[p];
      for (var value in objectValue1) {
        cy.compareJSONObjects(objectValue2[value], objectValue1[value]);
      }
    } else {
      if ((response[p] !== expectedResponse[p]) && !(['clientSecret', 'appId'].includes(p))) {
        cy.log("Different Value ->" + expectedResponse[p])
        assert.fail("JSON value mismatch for " + p)
      }
    }
  }
})

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
