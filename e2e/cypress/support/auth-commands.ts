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
  log.end()
})

Cypress.Commands.add('saveCookies', () => {
  //saving the session cookie
  cy.getCookies().then((cookies) => {
    cookies.map((cookie) => {
      Cypress.Cookies.preserveOnce(cookie.name)
    })
  })
})

Cypress.Commands.add('getSession', () => {
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

Cypress.Commands.add('logout', () => {
  cy.getSession().then(() => {
    cy.get('@session').then((res: any) => {
      cy.contains(res.body.user.name).click()
      cy.contains('Sign Out').click()
    })
  })
})
