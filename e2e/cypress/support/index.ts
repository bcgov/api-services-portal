import './commands'
import 'cypress-xpath'
import './auth-commands'
import './util-commands'
const _ = require('lodash')
const YAML = require('yamljs')

const addContext = require('mochawesome/addContext')

Cypress.on('test:after:run', (test: Mocha.Test, runnable: Mocha.Runnable) => {
  if (test.state === 'failed') {
    const screenshot = `assets/${Cypress.spec.name}/${runnable?.parent?.title} -- ${test.title} (failed).png`
    addContext({ test }, screenshot)
  }
})
