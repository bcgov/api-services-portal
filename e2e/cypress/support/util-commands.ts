const listOfCookies = [
  'AUTH_SESSION_ID_LEGACY',
  'KC_RESTART',
  'KEYCLOAK_IDENTITY_LEGACY',
  'KEYCLOAK_LOCALE',
  'KEYCLOAK_REMEMBER_ME',
  'KEYCLOAK_SESSION_LEGACY',
  '_oauth2_proxy',
  '_oauth2_proxy_csrf',
  'keystone.sid',
]

Cypress.Commands.add('preserveCookies', () => {
  cy.log('< Saving Cookies')
  Cypress.Cookies.preserveOnce(...listOfCookies)
  Cypress.Cookies.debug(true)
  cy.log('> Saving Cookies')
})

Cypress.Commands.add('preserveCookiesDefaults', () => {
  cy.log('< Saving Cookies as Defaults')
  Cypress.Cookies.defaults({
    preserve: [
      'AUTH_SESSION_ID_LEGACY',
      'KC_RESTART',
      'KEYCLOAK_IDENTITY_LEGACY',
      'KEYCLOAK_LOCALE',
      'KEYCLOAK_LOCALE',
      'KEYCLOAK_SESSION_LEGACY',
      '_oauth2_proxy',
      '_oauth2_proxy_csrf',
      'keystone.sid',
    ],
  })
  Cypress.Cookies.debug(true)
  cy.log('> Saving Cookies')
})

Cypress.Commands.add('saveState', (key: string, value: string) => {
  cy.log('< Saving State')
  debugger
  cy.log(key, value)
  const keyValue = key.toLowerCase()
  if (key.includes('>')) {
    let keyItems = key.split('>')
    cy.readFile('cypress/fixtures/state/store.json').then((currState) => {
      let newState = currState
      _.set(newState, keyItems, value)
      cy.writeFile('cypress/fixtures/state/store.json', newState)
    })
  }
  else {
    cy.readFile('cypress/fixtures/state/store.json').then((currState) => {
      currState[keyValue] = value
      cy.writeFile('cypress/fixtures/state/store.json', currState)
    })
  }
  cy.log('< Saving State')
})

Cypress.Commands.add('getState', (key: string) => {
  if (key.includes('>')) {
    let keyItems = key.split('>')
    cy.readFile('cypress/fixtures/state/store.json').then((state) => {
      return _.get(state, keyItems)
    })
  } else {
    cy.readFile('cypress/fixtures/state/store.json').then((state) => {
      return state[key]
    })
  }
})

Cypress.Commands.add('getPayload', (name: string) => {
  let payload = {}
  const connections = {
    rate_limiting: {
      "name": "rate-limiting",
      "config.hour": "20",
      "config.policy": "local"
    },
    ip_restriction: {
      "name": "ip-restriction",
      "config.allow": "192.168.0.1/0"
    }
  }
  if (name === 'rate-limiting')
    payload = connections.rate_limiting
  else
    payload = connections.ip_restriction
  return JSON.stringify(payload)
})


Cypress.Commands.add('resetState', () => {
  cy.readFile('cypress/fixtures/state/store.json').then((currState) => {
    currState = {}
    cy.writeFile('cypress/fixtures/state/store.json', currState)
  })
  cy.log('Test state was reset')
})

