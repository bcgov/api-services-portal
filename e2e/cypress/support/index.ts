import './commands'
import 'cypress-xpath'
import './auth-commands'
import './api-commands'

const addContext = require('mochawesome/addContext')

Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    const screenshot = `assets/${Cypress.spec.name}/${runnable.parent.title} -- ${test.title} (failed).png`
    addContext({ test }, screenshot)
  }
})
