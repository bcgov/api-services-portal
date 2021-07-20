Cypress.Commands.add('preserveCookies', () => {
  Cypress.Cookies.preserveOnce(
    ...[
      '_oauth2_proxy',
      '_oauth2_proxy_csrf',
      'ab547b670fc5c67e38dbef98822b7c8d',
      'keystone.sid',
    ]
  )
  Cypress.Cookies.debug(true, { verbose: false })
})

Cypress.Commands.add('saveState', (key: string, value: string) => {
  cy.log(key, value)
  if (key.includes('>')) {
    let keyItems = key.split('>')
    cy.readFile('cypress/fixtures/state/store.json').then((currState) => {
      let newState = currState
      _.set(newState, keyItems, value)
      cy.writeFile('cypress/fixtures/state/store.json', newState)
    })
  } else {
    cy.readFile('cypress/fixtures/state/store.json').then((currState) => {
      currState[key] = value
      cy.writeFile('cypress/fixtures/state/store.json', currState)
    })
  }
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

Cypress.Commands.add('clearState', () => {
  cy.readFile('cypress/fixtures/state/store.json').then((currState) => {
    currState = {}
    cy.writeFile('cypress/fixtures/state/store.json', currState)
  })
  cy.log('Test state was reset')
})
