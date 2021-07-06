Cypress.Commands.add('loginToDev', (username, password) => {
  const oidcProviderURL = new URL(Cypress.env('OIDC_ISSUER'))
  const appURL = new URL(Cypress.config('baseUrl'))

  cy.location().should((loc) => {
    expect(loc.protocol).to.eq(oidcProviderURL.protocol)
    expect(loc.hostname).to.eq(oidcProviderURL.hostname)
  })

  Cypress.log({
    name: 'Login to Dev',
    displayName: 'LOGIN_DEV',
    message: [`🔐 Authenticating | ${username}`],
  })

  cy.get('#username').type(username)
  cy.get('#password').type(password)
  cy.get('#kc-login').click()

  cy.location().should((loc) => {
    expect(loc.protocol).to.eq(appURL.protocol)
    expect(loc.hostname).to.eq(appURL.hostname)
  })
})

Cypress.Commands.add('verifySession', (url: string) => {
  cy.callApi({ method: 'GET', url: url }).then((res) => {
    expect(res.body).to.include({
      anonymous: false,
    })
    Cypress.log({
      name: 'Session Info',
      displayName: 'SESSION_INFO',
      message: JSON.stringify(res.body),
    })
    cy.log('Session established successfully')
  })
})
