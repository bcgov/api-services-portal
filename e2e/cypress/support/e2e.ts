import './commands'
import 'cypress-xpath'
import './auth-commands'
import './prep-commands'
import './util-commands'
import '@cypress/code-coverage/support'
const _ = require('lodash')
const YAML = require('yamljs')

const addContext = require('mochawesome/addContext')

Cypress.on('test:after:run', (test: Mocha.Test, runnable: Mocha.Runnable) => {
  if (test.state === 'failed') {
    const screenshot = `assets/${Cypress.spec.name}/${runnable?.parent?.title} -- ${test.title} (failed).png`
    addContext({ test }, screenshot)
  }
})

export const checkElementExists = (elm: any): boolean => {
  cy.get('body').then(($body) => {
    if ($body.find(elm).length > 0) {
      return true
    }
  })
  return false
}
