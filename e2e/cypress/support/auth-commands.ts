import { opendir } from 'fs'
import * as jwt from 'jsonwebtoken'

Cypress.Commands.add('login', (username, password) => {
  const oidcProviderURL = new URL(Cypress.env('OIDC_ISSUER'))
  const appURL = new URL(Cypress.config('baseUrl'))
  cy.xpath("//button[normalize-space()='Login']").click()
  cy.location().should((loc) => {
    expect(loc.protocol).to.eq(oidcProviderURL.protocol)
    expect(loc.hostname).to.eq(oidcProviderURL.hostname)
  })

  const log = Cypress.log({
    name: 'Login to Dev',
    displayName: 'LOGIN_DEV',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  })

  cy.get('#username').type(username)
  cy.get('#password').type(password)
  cy.get('#kc-login').click()

  cy.location().should((loc) => {
    expect(loc.protocol).to.eq(appURL.protocol)
    expect(loc.hostname).to.eq(appURL.hostname)
  })
  //saving the session cookie
  cy.getCookies().then((cookies) => {
    cookies.map((cookie) => {
      Cypress.Cookies.preserveOnce(cookie.name)
    })
  })

  log.end()
})

Cypress.Commands.add('getSession', (url: string) => {
  cy.request({ method: 'GET', url: url })
    .then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.include({ anonymous: false })
    })
    .then((response: any) => {
      const log = Cypress.log({
        name: 'Session Info',
        displayName: 'SESSION_INFO',
        message: JSON.stringify(response.body.user),
      })
    })
    .then((response) => {
      cy.wrap(response.body)
    })
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
      username: Cypress.env('PORTAL_USERNAME'),
      password: Cypress.env('PORTAL_PASSWORD'),
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
